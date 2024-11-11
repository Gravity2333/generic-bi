export * from '../utils/echarts/typings';
export * from './clickhouse';
export * from './dashboard';
export * from './report';
export * from './widget';
export * from './npmdDict';
export * from './mail';
export * from './customTimes';
export * from './user';
export * from './datasets'
export * from './database'
export * from './diffSql'
export * from './default'

export interface IPageFactory<T> {
  rows: T[];
  total: number;
  offset: number;
  limit: number;
  pageNumber?: number;
  pageSize?: number;
}
