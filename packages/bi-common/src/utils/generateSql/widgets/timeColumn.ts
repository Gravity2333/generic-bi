import { addArrayJoin } from '../..';
import { IWidgetSpecification } from '../../../typings';
import { getUtcTimeRange } from '../../datetime';
import {
  checkAggregateType,
  convertAggregateType,
  getColumnExpr,
  getOrderByExpr,
  getWhereExpr,
} from '../utils';
import * as SqlString from 'sqlstring';

export function generateTimeColumn(
  widgetSpecification: IWidgetSpecification,
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
  // 时间别名
  const timeAlias = time_field?.toUpperCase() || '';

  const { columnsExpr, colNamesList, colIdList } = getColumnExpr({
    metrics,
    groupby,
    timeField: timeAggType
      ? {
          field: time_field!,
          type: time_field_type!,
          aliasMode: timeAlias!,
        }
      : undefined,
  });

  sql += `SELECT ${columnsExpr},${(() => {
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
  })()}`;

  // 数据源
  let tableName = datasource;
  if (exist_rollup && time_grain && time_grain !== '1m') {
    tableName += `_${time_grain}`;
  }

  if (timeAggType) {
    /** 单独处理聚合类型 */
    sql += ` FROM (SELECT *,${convertAggregateType({
      field: time_field!,
      type: time_field_type!,
      aliasMode: timeAlias,
    })} FROM ${tableName} GROUP BY * )`;
  } else {
    sql += ` FROM ${tableName}`;
  }

  /** 时间 */
  const [startTime, endTime] = getUtcTimeRange(time_range!);
  const whereExpr = getWhereExpr({
    filters,
    timeRange: time_range!,
    timeField: time_field!,
    startTime,
    endTime,
    filterOperator
  });

  // where
  sql += `\n WHERE 1=1`;

  if (whereExpr && sql) {
    sql += ' AND ';
    sql += whereExpr;
  }

  // group by
  if (groupby?.length > 0) {
    sql += `\n GROUP BY ${groupby
      .map((group) => {
        const { type, field ,arrayJoin} = group;
        if (/^Array((.*))$/.test(type || '')) {
          return addArrayJoin(field,arrayJoin)
        }
        if (checkAggregateType(type!) && field === time_field) {
          return timeAlias;
        }
        return field;
      })
      .join(',')},${timeAlias}`;
  } else {
    sql += `\n GROUP BY ${timeAlias}\n`;
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

  // 排序
  let orderByExpr = getOrderByExpr(sorts);
  sql += `\n ${
    sorts && sorts?.length > 0
      ? orderByExpr + ',' + timeAlias
      : 'ORDER BY ' + timeAlias
  }`;

  // limit
  if (limit) {
    sql += `\n LIMIT ${SqlString.escape(limit)}`;
  }

  return {
    sql: sql.replace(/\n/g, ' '),
    colNames: colNamesList,
    colIdList: colIdList,
  };
}
