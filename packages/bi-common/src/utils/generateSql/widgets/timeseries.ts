import { addArrayJoin, getUtcTimeRange } from '../..';
import { INetworkInfoType, IWidgetSpecification } from '../../../typings';
import {
  checkAggregateType,
  convertAggregateType,
  getColumnExpr,
  getOrderByExpr,
  getWhereExpr,
} from '../utils';
import * as SqlString from 'sqlstring';

/**
 *
 * @param widgetSpecification
 * @returns 折线图SQL
 */

export function generateTimeHistgram(
  widgetSpecification: IWidgetSpecification,
  networkInfo: INetworkInfoType,
) {
  let sql = '';
  const {
    datasource,
    time_grain,
    metrics = [],
    filters = [],
    filterOperator = 'AND',
    groupby = [],
    havings = [],
    sorts = [],
    limit,
    time_field,
    time_range,
    time_field_type,
    exist_rollup,
  } = widgetSpecification;

  const timeAggType = checkAggregateType(time_field_type!);

  const { columnsExpr, colNamesList, colIdList } = getColumnExpr({
    metrics,
    groupby,
  });

  // 时间别名
  const timeAlias = time_field?.toUpperCase() || '';

  // 数据源
  let tableName = datasource;
  if (exist_rollup && time_grain && time_grain !== '1m') {
    tableName += `_${time_grain}`;
  }

  /** 时间 */
  const [startTime, endTime] = getUtcTimeRange(time_range!);
  const whereExpr = getWhereExpr({
    filters,
    timeRange: time_range!,
    timeField: time_field!,
    startTime,
    endTime,
    networkInfo,
    filterOperator,
  });

  // 排序
  let orderByExpr = getOrderByExpr(sorts);

  /** 拼接SQL */
  if (timeAggType) {
    /** 当时间类型为聚合类型时，需要单独处理时间字段 */
    sql = `select ${columnsExpr},${timeAlias} \n FROM (SELECT *,${convertAggregateType(
      {
        field: time_field!,
        type: time_field_type!,
        aliasMode: timeAlias,
      },
    )} FROM ${tableName} GROUP BY * ) \n WHERE 1=1 AND `;

    if (whereExpr) {
      sql += whereExpr;
    }

    // havging
    if (havings?.length > 0) {
      // 添加校验
      // HAVING 存在时，GROUP BY 也必须存在
      // @see: https://clickhouse.com/docs/en/sql-reference/statements/select/having/#limitations
      if (groupby?.length === 0) {
        throw new Error('HAVING can’t be used if aggregation is not performed');
      }

      sql += `\n HAVING (${havings.join(' AND ')})`;
    }
    sql += `\n GROUP BY ${groupby
      ?.filter((f) => f.field !== time_field)
      .map((g) => g.field)
      .concat(timeAlias)
      .join(',')} \n ${orderByExpr} ${
      limit ? `LIMIT ${SqlString.escape(limit)}` : ''
    }`;
  } else {
    sql = `select ${columnsExpr},${(() => {
      let interval = 60;
      if (time_grain === '1m') {
        interval = 60;
      } else if (time_grain === '1h') {
        interval = 3600;
      } else if (time_grain === '5m') {
        interval = 300;
      }
      if (!exist_rollup) {
        // 详单表 进行分时统计

        return `toDateTime(multiply(ceil(divide(toUnixTimestamp(${time_field}), ${interval})), ${interval}), 'UTC') as ${time_field?.toUpperCase()}`;
      }
      return `toStartOfInterval(${time_field}, INTERVAL ${interval} second) AS ${timeAlias}`;
    })()} \n FROM ${tableName} \n WHERE 1=1 AND `;
    if (whereExpr) {
      sql += whereExpr;
    }
    // havging
    if (havings?.length > 0) {
      // 添加校验
      // HAVING 存在时，GROUP BY 也必须存在
      // @see: https://clickhouse.com/docs/en/sql-reference/statements/select/having/#limitations
      if (groupby?.length === 0) {
        throw new Error('HAVING can’t be used if aggregation is not performed');
      }

      sql += `\n HAVING (${havings.join(' AND ')})`;
    }

    // 这时候分组有且只有一个值
    // 分布式表查询时，需要使用 global 关键字
    if (groupby.length > 0) {
      const { columnsExpr: globalInColumnsExpr } = getColumnExpr({
        metrics: [],
        groupby: [groupby[0]],
      });
      const globalInWhereExpr = getWhereExpr({
        filters,
        timeRange: time_range!,
        timeField: time_field!,
        startTime,
        endTime,
        networkInfo,
        filterOperator,
      });
      sql += ` AND ${(() => {
        if (/^Array((.*))$/.test(groupby[0].type || '')) {
          return addArrayJoin(groupby[0]?.field, groupby[0]?.arrayJoin);
        } else {
          return groupby[0]?.field;
        }
      })()} global IN ( SELECT ${globalInColumnsExpr} FROM  ${tableName} WHERE 1=1 ${
        globalInWhereExpr ? ` AND ${globalInWhereExpr}` : ''
      } \n GROUP BY ${groupby[0]?.field} \n ${orderByExpr} ${
        limit ? `LIMIT ${SqlString.escape(limit)}` : ''
      } ) \n GROUP BY ${timeAlias},${`\n${groupby
        .map((group) => {
          const { type, field, arrayJoin } = group;
          if (/^Array((.*))$/.test(type || '')) {
            return addArrayJoin(field, arrayJoin);
          }
          if (checkAggregateType(type!) && field === time_field) {
            return timeAlias;
          }
          return field;
        })
        .join(',')}`}`;
    } else {
      sql += `\n GROUP BY ${timeAlias} \n ${orderByExpr} ${
        limit ? `LIMIT ${SqlString.escape(limit)}` : ''
      }`;
    }
  }

  return {
    sql: sql.replace(/\n/g, ' '),
    colNames: colNamesList,
    colIdList: colIdList,
  };
}
