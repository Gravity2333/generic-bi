export interface IClickhouseTable {
  /** 表名 */
  name: string;
  /** 类型 */
  type: string;
  /** 表的描述信息 */
  comment?: string;
  /** 是否存在多时间粒度的表 */
  exist_rollup: boolean;
}