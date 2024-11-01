import { EChartsOption } from 'echarts';
import { CHART_THEME_COLOR_MAP, operator_ids } from '../dict';

/** 图表展示形式 */
export enum EVisualizationType {
  /** 大数字 */
  'BigNumberTotal' = 'big_number_total',
  /** 条形图 */
  'Bar' = 'bar',
  /** 柱状图 */
  'Column' = 'column',
  /** 时间直方图（可以是直线图、也可以是柱状图） */
  'TimeHistogram' = 'time_histogram',
  /** 饼图 */
  'Pie' = 'pie',
  /** Table */
  'Table' = 'table',
  /** SQL */
  'SQL' = 'sql',
  /** Time_Column */
  'Time_Column' = 'time_column',
}

/** 排序方式 */
export enum ESortDirection {
  'Desc' = 'desc',
  'Asc' = 'asc',
}

/** 单位格式化方式 */
export enum EFormatterType {
  /**
   * 带宽 bps
   */
  'Bps' = 'bps',
  /**
   * pps
   */
  // 'Pps' = 'pps',
  /**
   * 每秒的数量
   */
  // 'PerSecond' = 'perSecond',
  /**
   * 流量大小
   */
  'Bytes' = 'bytes',
  /**
   * 延迟时间ms
   */
  'Ms' = 'ms',
  /**
   * count
   */
  'Count' = 'count',
  /**
   * 原始值
   */
  'Raw' = 'raw',
  /**
   * 百分比
   */
  'Percent' = 'percent',
  /**
   * 个/秒
   */
  'CountPs' = 'count_ps',
}

/** 表格列 */
export type TableColumnType = {
  id: string;
  name: string;
  type: 'metric' | 'group';
  displayName?: string;
  fieldType?: string,
  isBandwidth?: boolean,
};

/** 字段操作符 */
export type TFieldOperator = (typeof operator_ids)[number];

/** 查询条件组合的方式 */
export enum EFilterGroupOperatorTypes {
  'AND' = 'AND',
  'OR' = 'OR',
}

/**
 * ClickHouse 常见的字段类型
 */
export type TCHFieldType =
  // String
  | 'String'
  | 'LowCardinality(String)'
  | 'LowCardinality(Nullable(String))'

  // 时间
  // 这里是时区不一定就是 UTC
  | "DateTime64(3, 'UTC')"
  | "DateTime('UTC')"

  // 无符号
  | 'UInt8'
  | 'UInt16'
  | 'UInt32'
  | 'UInt64'
  | 'UInt128'
  | 'UInt256'
  | 'UInt16'

  // IP 地址
  | 'IPv4'
  | 'Nullable(IPv4)'
  | 'IPv6'
  | 'Nullable(IPv6)'

  // 数组
  | 'Array(LowCardinality(String))'
  | 'Array(String)'
  | 'Array(IPv4)'
  | 'Array(IPv6)';

/**
 * 时间单位
 * @description 年|月|周|天|小时|分钟|秒
 */
export type TTimeUnit = 'y' | 'M' | 'w' | 'd' | 'h' | 'H' | 'm' | 's';

/** 过滤条件 */
export interface IFilter {
  /** 表达式类型 */
  expression_type: 'sql' | 'simple';

  // simple 模式
  // ===========
  field: string;
  /** 类型 */
  type?: string;
  // TODO: 这个字段后端其实可以知道
  // 字段类型
  field_type: TCHFieldType;
  // 操作符
  operator: TFieldOperator;
  // 过滤内容
  value: any; // string | number

  // sql 模式
  // ===========
  sql_expression: string | null;
}

export interface IFilterGroup {
  operator: EFilterGroupOperatorTypes;
  group: IFilterCondition;
}

export type IFilterCondition = (IFilterGroup | IFilter)[];

export enum EDenominatorType {
  'SINGLE' = 'single',
  'TIME_RANGE' = 'time_range',
}

// ==========================================

export interface IMetric {
  id: string;
  /** 表达式类型 */
  expression_type: 'sql' | 'simple';
  /** 计算方法 */
  aggregate?: 'AVG' | 'COUNT' | 'COUNT_DISTINCT' | 'MAX' | 'MIN' | 'SUM';
  /** 字段值 */
  field: string;
  /** 类型 */
  type?: string;
  // 自定义 sql 语句
  sql_expression: string | null;
  /** 自定义度量名称 */
  display_name?: string;
  /** 选择表格时启用，列格式化 */
  column_format?: string;
  /** 字段映射的字典字段 */
  dict_field?: string;
  /** 是否为带宽 */
  isBandwidth?: boolean;
  /** 标志线时使用 */
  denominator?: EDenominatorType;
  /** 标志线颜色 */
  color?: string;
  is_dict_mapping?: boolean;
}

export interface IFormMetric extends IMetric {
  comment: string;
  id: string;
  /** 展示的名字 */
  displayName?: string;
  /** 聚合函数和字段值拼接 */
  name: string;
  /** 列格式化，选择表格时启用 */
  columnFormat?: string;
}

export interface IGroupBy {
  field: string;
  /** 类型 */
  type?: string;
  /** 自定义度量名称 */
  display_name?: string;
  /** 选择表格时启用，列格式化 */
  column_format?: string;
  /** 字段映射的字典字段 */
  dict_field?: string;
  /** 连接符号 */
  connect_symbol?: string;
  /** 是否arrayJoin */
  arrayJoin?: boolean
}

export interface ITimeRange {
  type: 'range' | 'custom';
  /**
   * 自定义的时间（ISO格式）
   * @eg ['2021-12-02T15:43:50+0800','2021-12-02T14:43:50+0800']
   */
  custom: [string, string];

  /** 相对时间的数量 */
  range: number;
  /**
   * 相对时间的单位
   */
  unit: TTimeUnit;
  /** 包含开始时间 */
  include_lower: boolean;
  /** 包含结束时间 */
  include_upper: boolean;
}

/**
 * Widget的配置
 */
export interface IWidgetSpecification {
  /** 图形展示类型 */
  viz_type: EVisualizationType;

  // 数据查询
  // -----------------
  /** 数据源 */
  datasource: string;

  metrics: IMetric[];
  reference?: { expression_type: ESelectType.PERCENTAGE } & IMetric[];
  /** 字段过滤条件 */
  filters: IFilterCondition;
  filterOperator?: 'AND' | 'OR';
  // TODO: 补充类型定义
  havings: any[];

  /** 时间字段 */
  time_field?: string;
  /** 时间字段类型 */
  time_field_type?: string;
  /**
   * 时间粒度
   * @value 1m 原始表
   * @value 5m 5分钟聚合表
   * @value 1h 1小时聚合表
   */
  time_grain?: '1m' | '5m' | '1h';
  exist_rollup?: boolean;
  /**
   * 时间范围
   *
   * 1. 支持相对时间，例如最近5天
   * 2. 支持自定义时间设置
   */
  time_range?: ITimeRange;
  /** 刷新时间 */
  refresh_time?: number;

  /** groupby */
  groupby: IGroupBy[];
  /** 数量限制 */
  limit: number | null;
  /** 排序方式 */
  sorts: [IMetric, ESortDirection][];

  // 图表展示相关
  // -----------------
  /** Y轴格式化 */
  y_axis_format: EFormatterType;

  // 图表配置
  chart_properties?: Partial<ChartProperties>;
  /** table列顺序 */
  columns?: TableColumnType[];
  /** 图表内嵌 */
  widget_embed: boolean;
  /** 表格列信息 */
  table_columns?: any[];
  /** 自定义时间 custom_times */
  custom_times?: any;
  /** 模板封面数据 */
  templateCoverData?: string;
}

/**
 * EChart 的主题配色
 */
export type ChartTheme = keyof typeof CHART_THEME_COLOR_MAP;

export interface ChartProperties extends EChartsOption {
  /** 图表颜色主题 */
  theme: ChartTheme;
  /** 时间直方图相关 */
  is_smooth?: boolean;
  is_area?: boolean;
  is_stack?: boolean;
  /** pie相关 */
  threshold?: number;
  /** 柱状图&条形图相关 */
  show_bar_value?: boolean;
  /** 数字相关 */
  font_family?: string;
  font_size?: string;
  /** Table相关 */
  pagination?:
    | {
        pageSize: number;
      }
    | boolean;
  size?: 'default' | 'middle' | 'small';
  bordered?: boolean;
  ellipsis?: boolean;
  auto_resize?: boolean;
  column_padding?: number;
  colorRange?: [string, string];
  isColorRange?: boolean;
  rightYAxis?: {
    name: string;
    min: number;
    max: number;
    nameTextStyle: any;
    metrics: string[];
    format: EFormatterType;
  };
  custom_font_size: number;
  auto_size: boolean;
}

interface IWidgetBase {
  id?: string;
  name: string;
  datasource: string;
  viz_type: EVisualizationType;
  description?: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

/**
 * Widget
 */
export interface IWidget extends IWidgetBase {
  specification: IWidgetSpecification;
  readonly: string;
}

/**
 * Widget 的 Form 表单数据
 */
export interface IWidgetFormData extends IWidgetBase {
  specification: string;
  readonly: string;
  template: string;
}

export interface IReferenceResult {
  id: string;
  name: string;
  value: number;
}

export enum ESelectType {
  'SIMPLE' = 'simple',
  'SQL' = 'sql',
  'PERCENTAGE' = 'percentage',
}
