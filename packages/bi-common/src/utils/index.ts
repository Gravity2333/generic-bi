import {
  EFormatterType,
  EVisualizationType,
  IMetric,
  ITimeRange,
} from '../typings';

export * from './generateSql/index';
export * from './datetime';
export * from './formatter';
export * from './is';
export * from './echarts';
export * from './color';
export * from './filters';
export * from './mapping';
/**
 * 解析对象 JOSN
 */
export function parseObjJson<T extends Record<string, any>>(str: string): T {
  let obj = {} as T;
  try {
    obj = JSON.parse(str);
  } catch (error) {}
  return obj;
}

/**
 * 解析数组 JOSN
 */
export function parseArrayJson<T extends any>(str: string): Array<T> {
  let array: T[] = [];
  try {
    array = JSON.parse(str);
  } catch (error) {}

  return array;
}

/** 生成标志线查询条件 */
export const generateReferenceSpecification = ({
  datasource,
  reference,
  time_field,
  time_grain,
  time_range,
  exist_rollup,
}: {
  datasource: string;
  reference: IMetric;
  time_field?: string;
  time_grain?: '1m' | '5m' | '1h';
  time_range?: ITimeRange;
  exist_rollup: boolean;
}) => {
  return {
    viz_type: EVisualizationType.BigNumberTotal,
    datasource: datasource,
    metrics: [reference],
    filters: [],
    time_field,
    time_grain,
    time_range,
    groupby: [],
    limit: null,
    sorts: [],
    y_axis_format: EFormatterType.Raw,
    exist_rollup,
  };
};

/**
 * 获取 URL 中的某个参数
 * @param paramName
 * @returns
 */
export function getUrlParam(paramName: string) {
  const searchParams = new URLSearchParams(location.search);
  return searchParams.get(paramName);
}

/** 枚举值转对象 */
export const enum2Map = (enumValue: Record<string, any>) => {
  let obj = <Record<string, any>>{};
  Object.keys(enumValue)
    .filter((key) => isNaN(Number(key)))
    .forEach((key) => {
      obj[enumValue[key]] = key;
    });
  return obj;
};

/** 处理arrayjoin
 * @param field: 待处理字段
 * @param configArrayJoin: 用户配置的是否添加arrayjoin
 */
export function addArrayJoin(field: string, configArrayJoin: boolean = true) {
  if (false === configArrayJoin) return field;
  return `arrayJoin(${field})`;
}
