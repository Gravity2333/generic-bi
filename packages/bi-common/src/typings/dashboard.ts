import { ITimeRange } from '.';

interface IDashboardBase {
  id?: string;
  name: string;
  widget_ids?: string[];
  description?: string;
  created_at?: string;
  updated_at?: string;
  delete_ast?: string | null;
}

/**
 * Dashboard
 */
export interface IDashboard extends IDashboardBase {
  specification: IDashboardSpecification;
  readonly: string;
}

/**
 * Dashboard 的 Form 表单数据
 */
export interface IDashboardFormData extends IDashboardBase {
  specification: string;
  readonly: string;
}

/** Dashboard 的配置内容 */
export interface IDashboardSpecification {
  layouts: any[];
  time_range?: ITimeRange;
  texts?: Record<string, any>;
}
