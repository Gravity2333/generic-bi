export interface IWidget {
  id: string;
  name: string;
  queryObj: IQueryObject;
  specification: string;
  description: string;
  [key: string]: any;
}

export interface IQueryObject {
  measures: string[];
  dimensions: string[];
  order: {};
  timeDimensions: any;
  limit: number;
}

export interface ISchemaDetailItem {
  name: string;
  title: string;
  dimensions: any[];
  measures: any[];
  segments: any[];
}

export interface IDimension {
  title: string;
  name: string;
  type: string;
  shortTitle: string;
  suggestFilterValues: boolean;
  isVisible: boolean;
}

export interface IMesure {
  title: string;
  name: string;
  shortTitle: string;
  aggType: string;
  cumulative: boolean;
  cumulativeTotal: boolean;
  drillMembers: any;
  drillMembersGrouped: any;
  isVisible: boolean;
}