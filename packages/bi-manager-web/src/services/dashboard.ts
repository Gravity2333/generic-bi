import { API_PREFIX } from '@/common';
import { IAjaxResponseFactory, IPageParams, IPageResponseFactory } from '@/interface';
import { IDashboardFormData } from '@bi/common';
import { request } from 'umi';
import { downloadFile } from './downloadFile';

/**
 * 查询分页的 Dashboard
 */
export async function queryDashboards(params: { name?: string } & IPageParams) {
  return request<IPageResponseFactory<IDashboardFormData>>(`${API_PREFIX}/dashboards`, {
    method: 'GET',
    params: params,
  });
}

/**
 * 查询所有的 Dashboard
 */
export async function queryAllDashboards(params: { name?: string }) {
  return request<IAjaxResponseFactory<IDashboardFormData[]>>(`${API_PREFIX}/dashboards/as-list`, {
    method: 'GET',
    params: params,
  });
}

/**
 * 查询 Dashboard 详情
 * @param id dashboardId
 * @returns
 */
export async function queryDashboardDetail(id: string) {
  return request<IAjaxResponseFactory<IDashboardFormData>>(`${API_PREFIX}/dashboards/${id}`, {
    method: 'GET',
  });
}

/**
 * 新建 Dashboard
 */
export async function createDashboard(dashboardFormData: Omit<IDashboardFormData, 'id'>) {
  return request<IAjaxResponseFactory<IDashboardFormData>>(`${API_PREFIX}/dashboards`, {
    method: 'POST',
    data: dashboardFormData,
  });
}

/**
 * 查询所有的 默认Dashboard
 */
export async function queryAllDefaultDashboards() {
  return request<IAjaxResponseFactory<IDashboardFormData[]>>(
    `${API_PREFIX}/dashboards/default/as-list`,
    {
      method: 'GET',
    },
  );
}

/** 同步tab顺序 */
export async function syncDashboardSeq(ids: string) {
  return request(`${API_PREFIX}/dashboards/seq`, {
    method: 'POST',
    data: {
      ids,
    },
  });
}

/** 获得tab顺序 */
export async function queryDashboardSeq() {
  return request<IAjaxResponseFactory<{ ids: string }>>(`${API_PREFIX}/dashboards/seq`, {
    method: 'GET',
  });
}

/**
 * 编辑 Dashboard
 */
export async function updateDashboard(dashboardFormData: IDashboardFormData) {
  const { id, ...rest } = dashboardFormData;
  return request<IAjaxResponseFactory<IDashboardFormData>>(`${API_PREFIX}/dashboards/${id}`, {
    method: 'PUT',
    data: rest,
  });
}

/**
 * 删除 默认Dashboard
 * @param id dashboardId
 * @returns
 */
export async function deleteDeafultDashboard(id: string) {
  return request<IAjaxResponseFactory<any>>(`${API_PREFIX}/dashboards/default/${id}`, {
    method: 'DELETE',
  });
}

/**
 * 删除 Dashboard
 * @param id dashboardId
 * @returns
 */
export async function deleteDashboard(id: string) {
  return request<IAjaxResponseFactory<any>>(`${API_PREFIX}/dashboards/${id}`, {
    method: 'DELETE',
  });
}

/**
 * 批量删除 Dashboard
 * @param ids Dashboard[]
 * @returns
 */
export async function batchDeleteDashboard(ids: string) {
  return request<IAjaxResponseFactory<any>>(`${API_PREFIX}/dashboards/batch`, {
    method: 'DELETE',
    params: {
      ids,
    },
  });
}

/**
 * 导出为pdf
 * @param dashboardId
 * @returns
 */
export async function downloadPdf(id: string) {
  downloadFile(`/dashboards/${id}/export`);
}

/** 导出仪表盘 */
export async function exportDashboard({
  ids,
  exportWidgets = false,
}: {
  ids: string;
  exportWidgets?: boolean;
}) {
  downloadFile(
    `/dashboards/as-export?ids=${ids}&exportWidgets=${exportWidgets ? '1' : '0'}`,
  );
}
