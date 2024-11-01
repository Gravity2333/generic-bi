import { EFormatterType, EVisualizationType } from './typings/widget';

/**
 * 1k = 1000
 */
export const ONE_KILO_1000 = 1000;

/**
 * 1k = 1024
 */
export const ONE_KILO_1024 = 1024;

export const OPERATOR_LIST = [
  {
    value: 'EQUALS',
    label: '=',
  },
  {
    value: 'NOT_EQUALS',
    label: '!=',
  },
  {
    value: 'LESS_THAN',
    label: '<',
  },
  {
    value: 'GREATER_THAN',
    label: '>',
  },
  {
    value: 'LESS_THAN_OR_EQUAL',
    label: '<=',
  },
  {
    value: 'GREATER_THAN_OR_EQUAL',
    label: '>=',
  },
  {
    value: 'MATCH',
    label: 'MATCH',
  },
  // {
  //   value: 'IN',
  //   label: 'IN',
  // },
  // {
  //   value: 'NOT_IN',
  //   label: 'NOT IN',
  // },
  {
    value: 'LIKE',
    label: 'LIKE',
  },
  {
    value: 'NOT_LIKE',
    label: 'NOT LIKE',
  },
  {
    value: 'EXISTS',
    label: 'EXISTS',
  },
  {
    value: 'NOT_EXISTS',
    label: 'NOT EXISTS',
  },
] as const;

export const operator_ids = OPERATOR_LIST.map((item) => item.value);

/** 图表类型 */
export const CHART_TYPE_LIST: { label: string; value: EVisualizationType }[] = [
  {
    label: '数字',
    value: EVisualizationType.BigNumberTotal,
  },
  {
    label: '条形图',
    value: EVisualizationType.Bar,
  },
  {
    label: '柱状图',
    value: EVisualizationType.Column,
  },
  {
    label: '时间柱状图',
    value: EVisualizationType.Time_Column,
  },
  {
    label: '曲线图',
    value: EVisualizationType.TimeHistogram,
  },
  {
    label: '饼图',
    value: EVisualizationType.Pie,
  },
  {
    label: '表格',
    value: EVisualizationType.Table,
  },
  {
    label: '表格',
    value: EVisualizationType.SQL,
  },
];

export const CHART_TYPE_MAP = CHART_TYPE_LIST.reduce((prev, curr) => {
  return {
    ...prev,
    [curr.value]: curr,
  };
}, {} as Record<EVisualizationType, (typeof CHART_TYPE_LIST)[0]>);

/** 图表主题配色 */
export const CHART_THEME_COLOR_MAP = {
  default: [
    '#c23531',
    '#2f4554',
    '#61a0a8',
    '#d48265',
    '#91c7ae',
    '#749f83',
    '#ca8622',
    '#bda29a',
    '#6e7074',
    '#546570',
    '#c4ccd3',
  ],
  macarons: [
    '#2ec7c9',
    '#b6a2de',
    '#5ab1ef',
    '#ffb980',
    '#d87a80',
    '#8d98b3',
    '#e5cf0d',
    '#97b552',
    '#95706d',
    '#dc69aa',
    '#07a2a4',
    '#9a7fd1',
    '#588dd5',
    '#f5994e',
    '#c05050',
    '#59678c',
    '#c9ab00',
    '#7eb00a',
    '#6f5553',
    '#c14089',
  ],
  shine: [
    '#c12e34',
    '#e6b600',
    '#0098d9',
    '#2b821d',
    '#005eaa',
    '#339ca8',
    '#cda819',
    '#32a487',
  ],
};

/** 格式化坐标轴的类型 */
export const AXIS_FORMATTER_TYPE_LIST: {
  value: EFormatterType;
  label: string;
}[] = [
  {
    value: EFormatterType.Raw,
    label: '原始值',
  },
  {
    value: EFormatterType.Bps,
    label: '带宽（1000bps => 1Kbps）',
  },
  {
    value: EFormatterType.Bytes,
    label: '字节数（1000B => 1KB）',
  },
  {
    value: EFormatterType.Count,
    label: '数量（10000 => 10k）',
  },
  {
    value: EFormatterType.Ms,
    label: '时延（100 => 100ms）',
  },
  {
    value: EFormatterType.Percent,
    label: '百分比（0.01 => 1%）',
  },
  {
    value: EFormatterType.CountPs,
    label: '数量每秒（10000 => 10k/s）',
  },
];

/**
 * IPv4正则校验
 * @see: https://github.com/sindresorhus/ip-regex/blob/master/index.js
 */
export const IPv4Regex =
  /^(25[0-5]|2[0-4]\d|[0-1]\d{2}|[1-9]?\d)\.(25[0-5]|2[0-4]\d|[0-1]\d{2}|[1-9]?\d)\.(25[0-5]|2[0-4]\d|[0-1]\d{2}|[1-9]?\d)\.(25[0-5]|2[0-4]\d|[0-1]\d{2}|[1-9]?\d)$/;

/**
 * IPv4 掩码正则
 */
export const ipv4MaskRegex =
  /^((128|192)|2(24|4[08]|5[245]))(\.(0|(128|192)|2((24)|(4[08])|(5[245])))){3}$/;

/**
 * IPv6正则校验
 * @see: https://github.com/richb-intermapper/IPv6-Regex/blob/master/ipv6validator.js#L15
 */
export const IPv6Regex =
  /^((?:[a-fA-F\d]{1,4}:){7}(?:[a-fA-F\d]{1,4}|:)|(?:[a-fA-F\d]{1,4}:){6}(?:(25[0-5]|2[0-4]d|[0-1]d{2}|[1-9]?d).(25[0-5]|2[0-4]d|[0-1]d{2}|[1-9]?d).(25[0-5]|2[0-4]d|[0-1]d{2}|[1-9]?d).(25[0-5]|2[0-4]d|[0-1]d{2}|[1-9]?d)|:[a-fA-F\d]{1,4}|:)|(?:[a-fA-F\d]{1,4}:){5}(?::(25[0-5]|2[0-4]d|[0-1]d{2}|[1-9]?d).(25[0-5]|2[0-4]d|[0-1]d{2}|[1-9]?d).(25[0-5]|2[0-4]d|[0-1]d{2}|[1-9]?d).(25[0-5]|2[0-4]d|[0-1]d{2}|[1-9]?d)|(:[a-fA-F\d]{1,4}){1,2}|:)|(?:[a-fA-F\d]{1,4}:){4}(?:(:[a-fA-F\d]{1,4}){0,1}:(25[0-5]|2[0-4]d|[0-1]d{2}|[1-9]?d).(25[0-5]|2[0-4]d|[0-1]d{2}|[1-9]?d).(25[0-5]|2[0-4]d|[0-1]d{2}|[1-9]?d).(25[0-5]|2[0-4]d|[0-1]d{2}|[1-9]?d)|(:[a-fA-F\d]{1,4}){1,3}|:)|(?:[a-fA-F\d]{1,4}:){3}(?:(:[a-fA-F\d]{1,4}){0,2}:(25[0-5]|2[0-4]d|[0-1]d{2}|[1-9]?d).(25[0-5]|2[0-4]d|[0-1]d{2}|[1-9]?d).(25[0-5]|2[0-4]d|[0-1]d{2}|[1-9]?d).(25[0-5]|2[0-4]d|[0-1]d{2}|[1-9]?d)|(:[a-fA-F\d]{1,4}){1,4}|:)|(?:[a-fA-F\d]{1,4}:){2}(?:(:[a-fA-F\d]{1,4}){0,3}:(25[0-5]|2[0-4]d|[0-1]d{2}|[1-9]?d).(25[0-5]|2[0-4]d|[0-1]d{2}|[1-9]?d).(25[0-5]|2[0-4]d|[0-1]d{2}|[1-9]?d).(25[0-5]|2[0-4]d|[0-1]d{2}|[1-9]?d)|(:[a-fA-F\d]{1,4}){1,5}|:)|(?:[a-fA-F\d]{1,4}:){1}(?:(:[a-fA-F\d]{1,4}){0,4}:(25[0-5]|2[0-4]d|[0-1]d{2}|[1-9]?d).(25[0-5]|2[0-4]d|[0-1]d{2}|[1-9]?d).(25[0-5]|2[0-4]d|[0-1]d{2}|[1-9]?d).(25[0-5]|2[0-4]d|[0-1]d{2}|[1-9]?d)|(:[a-fA-F\d]{1,4}){1,6}|:)|(?::((?::[a-fA-F\d]{1,4}){0,5}:(25[0-5]|2[0-4]d|[0-1]d{2}|[1-9]?d).(25[0-5]|2[0-4]d|[0-1]d{2}|[1-9]?d).(25[0-5]|2[0-4]d|[0-1]d{2}|[1-9]?d).(25[0-5]|2[0-4]d|[0-1]d{2}|[1-9]?d)|(?::[a-fA-F\d]{1,4}){1,7}|:)))(%[0-9a-zA-Z]{1,})?$/;

/** 分享页面的地址前缀 */
export const SHARE_PAGE_PREFIX = '/share';

export const widgetTimeGranularities = [
  {
    name: 'second',
    title: 'Second',
  },
  {
    name: 'minute',
    title: 'Minute',
  },
  {
    name: 'hour',
    title: 'Hour',
  },
  {
    name: 'day',
    title: 'Day',
  },
  {
    name: 'week',
    title: 'Week',
  },
  {
    name: 'month',
    title: 'Month',
  },
  {
    name: 'quarter',
    title: 'Quarter',
  },
  {
    name: 'year',
    title: 'Year',
  },
];

export type AggregateType =
  | 'AVG'
  | 'COUNT'
  | 'COUNT_DISTINCT'
  | 'MAX'
  | 'MIN'
  | 'SUM'
  | 'length';

export const AggregateList: AggregateType[] = [
  'AVG',
  'COUNT',
  'COUNT_DISTINCT',
  'MAX',
  'MIN',
  'SUM',
  'length',
];

export const AggregateNameDict = {
  AVG: '均值',
  COUNT: '计数',
  COUNT_DISTINCT: '去重计数',
  MAX: '最大值',
  MIN: '最小值',
  SUM: '求和',
  length: '计算长度',
};

export enum ELegendPosition {
  LEFT = 'left',
  TOP = 'top',
  RIGHT = 'right',
  BOTTOM = 'bottom',
}

export const LegendPosDict = {
  [ELegendPosition.LEFT]: {
    orient: 'vertical',
    y: 'center',
    x: 'left',
  },
  [ELegendPosition.TOP]: {
    orient: 'horizontal',
    y: 'top',
    x: 'center',
  },
  [ELegendPosition.RIGHT]: {
    orient: 'vertical',
    y: 'center',
    x: 'right',
  },
  [ELegendPosition.BOTTOM]: {
    orient: 'horizontal',
    y: 'bottom',
  },
};

export const SYSTEM_DASHBOARD_ID = '59fe9c03-f2ed-4725-a754-f80a3499d0f7';
export const SYSTEM_DASHBOARD_NAME = '系统仪表盘';
export enum EBIVERSION {
  'CMS' = 'CMS',
  'NPMD' = 'NPMD',
}
