import type { ColDef, ICellRendererParams } from 'ag-grid-community';

export type ColumnType<T> = Omit<ColDef<T>, 'field' | 'cellRenderer'> & {
  field: string;
  headerName: string;
  cellRenderer?: (params: ICellRendererParams<T>) => React.ReactNode;
  render?: (text: string) => React.ReactNode;
};

export interface IPagination {
  total: number;
  pageSize: number;
  current: number;
}

export interface IColumnStorage {
  field: string;
  width: number;
  hide: boolean;
}

/**
 * 排序方向
 */
export enum ESortDirection {
  'DESC' = 'desc',
  'ASC' = 'asc',
}
