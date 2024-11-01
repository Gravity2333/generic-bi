import { IReferenceResult, IWidgetSpecification } from '@bi/common';

export interface IWidgetExploreParams {
  formData: IWidgetSpecification;
  queryId?: string,
}

export interface IWidgetExploreResult {
  sql: string;
  explain: string;
  formData: IWidgetSpecification;
  data: any[];
  colNames: string[];
  colIdList: string[];
  references?: IReferenceResult[];
}
