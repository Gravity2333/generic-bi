import { API_PREFIX } from '@/common';
import { IAjaxResponseFactory, IWidgetExploreParams, IWidgetExploreResult } from '@/interface';
import { ITimeRange, IWidgetFormData } from '@bi/common';
import moment from 'moment';
import { request } from 'umi';
import { downloadFile } from './downloadFile';
import { message, notification } from 'antd';

export interface IPageProps {
  pageNumber: number;
  pageSize: number;
  name?: string;
}
/** 查询分页widgets */
export async function queryWidgets(params: IPageProps) {
  return request<IAjaxResponseFactory<IWidgetFormData[]>>(`${API_PREFIX}/widgets`, {
    method: 'GET',
    params,
  });
}
/**
 * 查询所有的 Widget
 */
export async function queryAllWidgets() {
  return request<IAjaxResponseFactory<IWidgetFormData[]>>(`${API_PREFIX}/widgets/as-list`, {
    method: 'GET',
  });
}

/**
 * 查询所有的模板 Widget
 */
export async function queryAllTemplateWidgets() {
  return request<IAjaxResponseFactory<IWidgetFormData[]>>(`${API_PREFIX}/widgets/templates`, {
    method: 'GET',
  });
}

/**
 * 查询 Widget 详情
 * @param id widgetId
 * @returns
 */
export async function queryWidgetDetail(id: string) {
  return request<IAjaxResponseFactory<IWidgetFormData>>(`${API_PREFIX}/widgets/${id}`, {
    method: 'GET',
  });
}

/**
 * 查询 Widget 的数据结果
 * @param id widgetId
 * @returns
 */
export async function queryWidgetData(
  id: string,
  queryId?: string,
  time_range?: ITimeRange,
  time_grain?: '1m' | '5m' | '1h',
) {
  const custom = (() => {
    if (typeof time_range?.custom[0] === 'string' && typeof time_range?.custom[1] === 'string') {
      if (!isNaN(+time_range?.custom[0]) && !isNaN(+time_range?.custom[1])) {
        return [moment(+time_range?.custom[0]).valueOf(), moment(+time_range?.custom[1]).valueOf()];
      }
    }
    return [moment(time_range?.custom[0]).valueOf(), moment(time_range?.custom[1]).valueOf()];
  })();
  return request<
    IAjaxResponseFactory<{
      sql: string;
      colNames: string[];
      explain: string;
      data: any;
    }>
  >(
    `${API_PREFIX}/widgets/${id}/data${queryId ? `?queryId=${queryId}` : ''}${
      time_range && time_range?.custom?.length === 2
        ? `&time_range=${JSON.stringify({
            ...time_range,
            custom,
          })}`
        : ''
    }${time_grain ? `&time_grain=${time_grain}` : ''}`,
    {
      method: 'GET',
    },
  );
}

/**
 *
 * 取消查询
 */
export async function cancelQueryWidgetData(queryIds: string) {
  return request<IAjaxResponseFactory<IWidgetFormData>>(`${API_PREFIX}/slow-queries/cancel`, {
    method: 'POST',
    data: {
      queryIds,
    },
  });
}

/**
 *
 * 取消所有查询
 */
export async function cancelAllQuery() {
  return request<IAjaxResponseFactory<IWidgetFormData>>(`${API_PREFIX}/slow-queries/cancelAll`, {
    method: 'POST',
  });
}

/**
 * 新建 Widget
 */
export async function createWidget(widgetFormData: Omit<IWidgetFormData, 'id'>) {
  return request<IAjaxResponseFactory<IWidgetFormData>>(`${API_PREFIX}/widgets`, {
    method: 'POST',
    data: widgetFormData,
  });
}

/**
 * 编辑 Widget
 */
export async function updateWidget(widgetFormData: IWidgetFormData) {
  const { id, ...rest } = widgetFormData;
  return request<IAjaxResponseFactory<IWidgetFormData>>(`${API_PREFIX}/widgets/${id}`, {
    method: 'PUT',
    data: rest,
  });
}

/**
 * 删除 Widget
 * @param id widgetId
 * @returns
 */
export async function deleteWidget(id: string) {
  return request<IAjaxResponseFactory<any>>(`${API_PREFIX}/widgets/${id}`, {
    method: 'DELETE',
  });
}

/**
 * 批量删除 Widget
 * @param ids widgetId[]
 * @returns
 */
export async function batchDeleteWidget(ids: string) {
  return request<IAjaxResponseFactory<any>>(`${API_PREFIX}/widgets/batch`, {
    method: 'DELETE',
    params: {
      ids,
    },
  });
}

/**
 * 探索数据
 */
export async function widgetExplore(params: IWidgetExploreParams) {
  return request<IAjaxResponseFactory<IWidgetExploreResult>>(`${API_PREFIX}/explore-json`, {
    method: 'POST',
    data: params,
  });
}

/** 导出widget */
export async function widgetExport(ids: string) {
  downloadFile(`${API_PREFIX}/widgets/as-export?ids=${ids}`);
}

/**
 * 下载为EXCEL
 * @param widgetId
 * @returns
 */
export async function downloadWidgetExcel(id: string) {
  downloadFile(`${API_PREFIX}/widgets/${id}/export?type=excel`);
}

/**
 * 下载为CSV
 * @param widgetId
 * @returns
 */
export async function downloadWidgetCSV(id: string) {
  downloadFile(`${API_PREFIX}/widgets/${id}/export?type=csv`);
}
