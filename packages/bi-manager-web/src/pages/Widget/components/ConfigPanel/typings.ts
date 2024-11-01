import { IFilter, IFilterGroup} from '@bi/common';

export interface IFormTimeRange {
  type: 'range' | 'custom';
  custom: [string, string];
  range: number;
  unit: string;
  include_lower: boolean;
  include_upper: boolean;
  label: string;
}

export enum ETimeSelectType {
  RANGE = 'range',
  CUSTOM = 'custom',
}

export enum ETimeUnit {
  M = '月',
  w = '周',
  d = '天',
  H = '小时',
  m = '分钟',
}

export enum EFilterType {
  WHERE = 'where',
  HAVING = 'having',
}

export const brushMenuType = ['change_time', 'jump_to_page'];

export enum EBrushMenuName {
  'change_time' = '修改时间',
  'jump_to_page' = '跳转',
}

export type IDisplayFilter = (IFilter & { id: string }) | (IFilterGroup & { id: string });
export type ICustomFilter = IFilter & { id: string; filter_type?: EFilterType };

export const REFRESH_TIME_LIST = [
  {
    name: '1秒',
    value: 1000,
  },
  {
    name: '30秒',
    value: 30000,
  },
  {
    name: '1分钟',
    value: 60000,
  },
  {
    name: '5分钟',
    value: 300000,
  },
  {
    name: '10分钟',
    value: 600000,
  },
  {
    name: '30分钟',
    value: 1800000,
  },
];
