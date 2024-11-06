import { addArrayJoin } from '../..';
import {
  ECustomTimeType,
  ESortDirection,
  ICustomTime,
  IFilterCondition,
  IGroupBy,
  IMetric,
  ITimeRange,
  weekValue,
} from '../../../typings';
import { filterCondition2Sql } from '../../filters';

/** 处理一次性时间 */
function getDisposableTime({
  customTimeSetting,
  timeField,
  currentWhereExpr,
}: {
  customTimeSetting: any;
  timeField: string;
  currentWhereExpr: string;
}) {
  let customStartTime = '';
  let customEndTime = '';
  Object.keys(customTimeSetting).forEach((k) => {
    if (k?.includes('start_time')) {
      customStartTime = customTimeSetting[k];
    }
    if (k?.includes('end_time')) {
      customEndTime = customTimeSetting[k];
    }
  });
  if (customStartTime && customEndTime) {
    const customTimeWhereExpr = `${timeField} >= toDateTime64('${customStartTime}', 3, 'UTC') AND ${timeField} <= toDateTime64('${customEndTime}', 3, 'UTC')`;
    if (currentWhereExpr) {
      currentWhereExpr += ' AND ';
      currentWhereExpr += '(';
      currentWhereExpr += customTimeWhereExpr;
      currentWhereExpr += ')';
    } else {
      currentWhereExpr += customTimeWhereExpr;
    }
  }
  return currentWhereExpr;
}

/** 处理周期性时间 */
function getPeriodicTime({
  period,
  customTimeSettingList,
  timeField,
  currentWhereExpr,
}: {
  period: string;
  customTimeSettingList: any[];
  timeField: string;
  currentWhereExpr: string;
}) {
  const periodList = JSON.parse(period);
  /** 处理周期性时间 */
  if (period?.length > 0 && customTimeSettingList?.length > 0) {
    /** 处理开始结束时间 */
    let customTimeWhereExpr = '';
    for (const customTimeSetting of customTimeSettingList) {
      let customStartTime = '';
      let customEndTime = '';
      Object.keys(customTimeSetting).forEach((k) => {
        if (k?.includes('start_time')) {
          customStartTime = customTimeSetting[k];
        }
        if (k?.includes('end_time')) {
          customEndTime = customTimeSetting[k];
        }
      });
      if (customStartTime && customEndTime) {
        const [startH, startM, startS] = customStartTime.split(':');

        const [endH, endM, endS] = customEndTime.split(':');

        const startStamp =
          (+startH - 8 || 0) * 3600 + (+startM || 0) * 60 + (+startS || 0);

        const endStamp =
          (+endH - 8 || 0) * 3600 + (+endM || 0) * 60 + (+endS || 0);

        const customTimeSubWhereExpr = `( toHour(${timeField}) * 3600 + toMinute(${timeField}) * 60 + toSecond(${timeField}) between ${startStamp} and  ${endStamp} )`;

        if (customTimeWhereExpr) {
          customTimeWhereExpr += ' OR ';
          customTimeWhereExpr += '(';
          customTimeWhereExpr += customTimeSubWhereExpr;
          customTimeWhereExpr += ')';
        } else {
          customTimeWhereExpr += customTimeSubWhereExpr;
        }
      }
    }
    if (currentWhereExpr) {
      currentWhereExpr += ' AND ';
      currentWhereExpr += '(';
      currentWhereExpr += customTimeWhereExpr;
      currentWhereExpr += ')';
    } else {
      currentWhereExpr += customTimeWhereExpr;
    }

    /** 处理周期perios */
    let periodFilter = ``;
    for (const p of periodList) {
      if (periodFilter) {
        periodFilter += ' OR ';
      }
      periodFilter += `( toDayOfWeek(${timeField}) = ${weekValue[p]} )`;
    }
    if (currentWhereExpr) {
      currentWhereExpr += ' AND ';
      currentWhereExpr += '(';
      currentWhereExpr += periodFilter;
      currentWhereExpr += ')';
    } else {
      currentWhereExpr += periodFilter;
    }
    return currentWhereExpr;
  }
  return currentWhereExpr;
}

/** 获取where字段 */
export function getWhereExpr({
  filters,
  timeRange,
  timeField = '',
  startTime,
  endTime,
  filterOperator = 'AND',
  customTimes,
}: {
  filters: IFilterCondition;
  timeRange: ITimeRange;
  timeField: string;
  startTime?: string;
  endTime?: string;
  filterOperator: string;
  customTimes?: ICustomTime;
}) {
  let whereExpr = '';
  if (filters.length > 0) {
    whereExpr += '(';
    whereExpr += filterCondition2Sql(filters, filterOperator);
    whereExpr += ')';
  }

  if(startTime&&endTime){
    const startTimeOperator = timeRange!.include_lower ? '>=' : '>';
    const endTimeOperator = timeRange!.include_upper ? '<=' : '<';
  
    const timeWhereExpr = `(${timeField} ${startTimeOperator} toDateTime64('${startTime}', 3, 'UTC') AND ${timeField} ${endTimeOperator} toDateTime64('${endTime}', 3, 'UTC'))`;
  
    if (whereExpr) {
      whereExpr += ' AND ';
      whereExpr += '(';
      whereExpr += timeWhereExpr;
      whereExpr += ')';
    } else {
      whereExpr += timeWhereExpr;
    }
  }

  if (customTimes) {
    /** 处理生效时间 */
    const { type, period = '[]', custom_time_setting } = customTimes;

    const customTimeSettingList =
      (JSON.parse(custom_time_setting) as Record<string, string>[]) || [];

    if (type === ECustomTimeType.PeriodicTime) {
      whereExpr = getPeriodicTime({
        period,
        customTimeSettingList,
        timeField,
        currentWhereExpr: whereExpr,
      });
    } else if (
      type === ECustomTimeType.DisposableTime &&
      customTimeSettingList[0]
    ) {
      whereExpr = getDisposableTime({
        customTimeSetting: customTimeSettingList[0],
        currentWhereExpr: whereExpr,
        timeField,
      });
    }
  }
  return whereExpr;
}

/** 记录 Select 后面的字段 */
export const addCol = (
  col: string,
  id = '',
  colNamesList: string[],
  colIdList: string[],
) => {
  if (!colNamesList.includes(col)) {
    colNamesList.push(col);
    colIdList.push(id);
  }
};

/** 获取排序字段 */
export function getOrderByExpr(sorts: [IMetric, ESortDirection][]) {
  // order by
  let orderByExpr = '';
  if (sorts.length > 0) {
    orderByExpr += `ORDER BY `;
    orderByExpr += sorts
      .map(([metric, direction]) => {
        let sortField: string = '';

        if (metric.expression_type === 'sql') {
          sortField = metric.sql_expression!;
        } else {
          sortField = (() => {
            if (metric.aggregate) {
              if (metric.aggregate === 'COUNT_DISTINCT') {
                return `count(DISTINCT ${metric.field})`;
              }
              return `${metric.aggregate.toLocaleUpperCase()}(${metric.field})`;
            }
            return metric.field;
          })();
        }

        return `${sortField} ${direction}`;
      })
      .filter((el) => el)
      .join(',');
  }
  return `\n ${orderByExpr || ''}`;
}

// const TO_IPV6_ALIAS = '_TO_IPV6_ALIAS';

function formatIpv6Sql(field: string) {
  return [
    `if(isNull(${field}), '', if(startsWith(IPv6NumToString(${field}), '::ffff:'), substring(IPv6NumToString(${field}), 8), IPv6NumToString(${field}))) AS ${field}`,
    field,
  ];
}

export function getColumnExpr({
  metrics,
  groupby,
  timeField,
}: {
  metrics: IMetric[];
  groupby: IGroupBy[];
  timeField?: {
    field: string;
    type: string;
    aliasMode: 'upper' | 'default' | string;
  };
}) {
  let columnsExpr = '*';
  // 选择的字段
  let colNamesList: string[] = [];
  // 展示字段ID
  let colIdList: string[] = [];

  if (metrics.length > 0) {
    columnsExpr = metrics
      .map((row) => {
        if (row.expression_type === 'simple') {
          const { id, type, field } = row;
          if (
            timeField &&
            type === timeField.type &&
            field === timeField.field
          ) {
            let alias = field;
            if (timeField.aliasMode === 'upper') {
              alias = field.toUpperCase();
            } else if (timeField.aliasMode !== 'default') {
              alias = timeField.aliasMode;
            }
            addCol(alias, id, colNamesList, colIdList);
            return alias;
          }
          if (/^AggregateFunction((.*))$/.test(type || '')) {
            const mergeList = type?.match(/^AggregateFunction((.*))$/);
            if (mergeList && mergeList?.length > 1 && mergeList[1]) {
              const mergeType = mergeList[1]?.slice(1, -1)?.split(',')[0];
              if (mergeType === 'min') {
                const fieldText = `minMerge(${field}) AS ${`"MINMERGE(${field})"`}`;
                addCol(fieldText, id, colNamesList, colIdList);
                return fieldText;
              } else if (mergeType === 'max') {
                const fieldText = `maxMerge(${field}) AS ${`"MAXMERGE(${field})"`}`;
                addCol(fieldText, id, colNamesList, colIdList);
                return fieldText;
              }
            }
          }

          // @see: https://clickhouse.com/docs/en/sql-reference/aggregate-functions/reference/count/#agg_function-count
          if (row.aggregate === 'COUNT_DISTINCT') {
            const fieldText = `count(DISTINCT ${field})`;
            addCol(`count(DISTINCT ${field})`, id, colNamesList, colIdList);
            return `${fieldText} AS "count(DISTINCT ${field})"`;
          }
          // 有 func 函数
          if (row.aggregate) {
            const fieldText = `${row.aggregate.toLocaleUpperCase()}(${field})`;
            addCol(fieldText, id, colNamesList, colIdList);
            return `${row.aggregate}(${field}) AS "${fieldText}"`;
          }
          // 原始字段
          addCol(field, id, colNamesList, colIdList);
          return field;
        } else {
          const { sql_expression = '', type } = row;
          // 自定义 sql
          if (type?.includes('IPv6')) {
            const [newExpression, alias] = formatIpv6Sql(sql_expression!);
            addCol(alias || '', row?.id, colNamesList, colIdList);
            // TODO: 防 sql 注入
            return newExpression;
          } else {
            const sqlExpression = sql_expression || '';
            addCol(sqlExpression, row?.id, colNamesList, colIdList);
            // TODO: 防 sql 注入
            return `${sqlExpression} AS "${sqlExpression}"`;
          }
        }
      })
      .join(',');
  }

  // group by的字段也要放进来 select 的字段中
  if (groupby.length > 0) {
    if (columnsExpr === '*') {
      // 说明上面 metrics 为空
      colNamesList = groupby.map((group) => {
        const { field, type, arrayJoin } = group;
        colIdList.push(field || '');
        if (timeField && type === timeField.type && field === timeField.field) {
          let alias = field;
          if (timeField.aliasMode === 'upper') {
            alias = field.toUpperCase();
          } else if (timeField.aliasMode !== 'default') {
            alias = timeField.aliasMode;
          }
          return alias;
        }
        if (/^Array((.*))$/.test(type || '')) {
          return addArrayJoin(field, arrayJoin);
        }
        if (/^AggregateFunction((.*))$/.test(type || '')) {
          const mergeList = type?.match(/^AggregateFunction((.*))$/);
          if (mergeList && mergeList?.length > 1 && mergeList[1]) {
            const mergeType = mergeList[1]?.slice(1, -1)?.split(',')[0];
            if (mergeType === 'min') {
              const fieldText = `minMerge(${field}) AS ${`"MINMERGE(${field})"`}`;
              return fieldText;
            } else if (mergeType === 'max') {
              const fieldText = `maxMerge(${field}) AS ${`"MAXMERGE(${field})"`}`;
              return fieldText;
            }
          }
        }
        if (type?.includes('IPv6')) {
          const [newField] = formatIpv6Sql(field);
          return newField;
        }
        return field;
      });

      const arrayJoinList = colNamesList.filter((c) =>
        /^arrayJoin((.*))$/.test(c),
      );
      columnsExpr = colNamesList
        .filter((c) => !arrayJoinList.includes(c))
        .join(',');

      if (arrayJoinList?.length > 0) {
        if (columnsExpr !== '') {
          columnsExpr += ',';
        }
        columnsExpr += arrayJoinList.join(',');
      }
    } else {
      //这里需要去重
      const filterGroupBy: string[] = [];
      groupby.forEach((group) => {
        const { field, type, arrayJoin } = group;
        if (!colNamesList.includes(field)) {
          colIdList.push(field);
          if (
            timeField &&
            type === timeField.type &&
            field === timeField.field
          ) {
            let alias = field;
            if (timeField.aliasMode === 'upper') {
              alias = field.toUpperCase();
            } else if (timeField.aliasMode !== 'default') {
              alias = timeField.aliasMode;
            }
            colNamesList.push(alias);
            filterGroupBy.push(alias);
          } else if (/^Array((.*))$/.test(type || '')) {
            const c = addArrayJoin(field, arrayJoin);
            colNamesList.push(c);
            filterGroupBy.push(c);
          } else if (/^AggregateFunction((.*))$/.test(type || '')) {
            const mergeList = type?.match(/^AggregateFunction((.*))$/);
            if (mergeList && mergeList?.length > 1 && mergeList[1]) {
              const mergeType = mergeList[1]?.slice(1, -1)?.split(',')[0];
              if (mergeType === 'min') {
                const fieldText = `minMerge(${field}) as ${`"MINMERGE(${field})"`}`;
                colNamesList.push(fieldText);
                filterGroupBy.push(fieldText);
              } else if (mergeType === 'max') {
                const fieldText = `maxMerge(${field}) as ${`"MAXMERGE(${field})"`}`;
                colNamesList.push(fieldText);
                filterGroupBy.push(fieldText);
              }
            }
          } else {
            if (type?.includes('IPv6')) {
              const [newField, alias] = formatIpv6Sql(field);
              colNamesList.push(alias);
              filterGroupBy.push(newField);
            } else {
              colNamesList.push(field);
              filterGroupBy.push(field);
            }
          }
        }
      });

      if (filterGroupBy.length > 0) {
        columnsExpr += ',';
        columnsExpr += filterGroupBy.join(',');
      }
    }
  }

  return {
    columnsExpr,
    colNamesList,
    colIdList,
  };
}

/** 检查是否是聚合字段类型 */
export function checkAggregateType(type: string) {
  return !!/^AggregateFunction((.*))$/.test(type || '');
}

/** 转换聚合字段类型 */
export function convertAggregateType({
  field,
  type,
  aliasMode,
}: {
  field: string;
  type: string;
  aliasMode: 'upper' | 'default' | string;
}) {
  const mergeList = type?.match(/^AggregateFunction((.*))$/);
  if (mergeList && mergeList?.length > 1 && mergeList[1]) {
    let alias = field;
    if (aliasMode === 'upper') {
      alias = field.toUpperCase();
    } else if (aliasMode !== 'default') {
      alias = aliasMode;
    }

    const mergeType = mergeList[1]?.slice(1, -1)?.split(',')[0];
    if (mergeType === 'min') {
      return `minMerge(${field}) as ${alias}`;
    } else if (mergeType === 'max') {
      return `maxMerge(${field}) as ${alias}`;
    }
  }
}
