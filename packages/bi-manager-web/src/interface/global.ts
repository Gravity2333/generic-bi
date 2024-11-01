export enum EStatus {
  'Success' = 0,
  'Failure' = 1,
}
/** ajax返回值 */
export interface IAjaxResponseFactory<T> {
  data: T;
  success: boolean;
  message?: string;
}

/** ·分页返回值 */
export interface IPageFactory<T> extends IPageParams {
  rows: T[];
  total: number;
  offset: number;
  limit: number;
}

export type IPageResponseFactory<T> = IAjaxResponseFactory<IPageFactory<T>>;

/** 分页搜索 */
export interface IPageParams {
  /** 当前的页码 */
  pageNumber?: number;
  /** 页面的容量 */
  pageSize?: number;
}

export interface IProTableData<T> {
  success: boolean;
  data: T;
  page: number;
  total: number;
}

export interface LabelAndValue {
  label: string;
  value: any;
}

export enum ESortDirection {
  ASC = 'asc',
  DESC = 'desc',
}
export interface SortParams {
  sortProperty?: string;
  sortDirection?: ESortDirection;
}
