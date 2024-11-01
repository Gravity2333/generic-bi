/**
 * show tables 返回值
 */
export interface IClickhouseResponseFactory<T> {
  data: T;
  rows: number;
  [key: string]: any;
}

export interface IDatasetTable {
  /** 表名 */
  name: string;
  /** 类型 */
  type: string;
  /** 表的描述信息 */
  comment?: string;
  /** 是否存在多时间粒度的表 */
  exist_rollup: boolean;
}
export interface IClickhouseColumn {
  /** 字段名 */
  name: string;
  /** 字段类型 */
  type: string;
  default_type: string;
  default_expression: string;
  /** 字段备注信息 */
  comment: string;
  codec_expression: string;
  ttl_expression: string;

  /** 字段映射的字典字段 */
  dict_field?: string;
}
