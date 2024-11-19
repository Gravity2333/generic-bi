import { API_PREFIX } from '@/common';
import { IAjaxResponseFactory} from '@/interface';
import {  IWidgetFormData } from '@bi/common';
import { request } from 'umi';
import { downloadFile } from './downloadFile';

/** 探索sql */
export async function exploreSqlJson(sql: string, queryId: string,database: string) {
  return request<IAjaxResponseFactory<{
    success: boolean,
    message?: string,
    data?: IWidgetFormData[]
  }>>(`${API_PREFIX}/sql-json/explore`, {
    method: 'GET',
    params: { sql, queryId,database },
  });
}

/**
 * 查询所有的 sql-json
 */
export async function queryAllSqlJson() {
  return request<IAjaxResponseFactory<IWidgetFormData[]>>(`${API_PREFIX}/sql-json/as-list`, {
    method: 'GET',
  });
}

/**
 * 新建 Widget
 */
export async function createSqlJson(sqlJsonFormData: Omit<IWidgetFormData, 'id'>) {
  return request<IAjaxResponseFactory<IWidgetFormData>>(`${API_PREFIX}/sql-json`, {
    method: 'POST',
    data: sqlJsonFormData,
  });
}

/**
 * 编辑 Widget
 */
export async function updateSqlJson(widgetFormData: IWidgetFormData) {;
  const { id, ...rest } = widgetFormData;
  return request<IAjaxResponseFactory<IWidgetFormData>>(`${API_PREFIX}/sql-json/${id}`, {
    method: 'PUT',
    data: rest,
  });
}

/**
 * 删除 Widget
 * @param id widgetId
 * @returns
 */
export async function deleteSqlJson(id: string) {
  return request<IAjaxResponseFactory<any>>(`${API_PREFIX}/sql-json/${id}`, {
    method: 'DELETE',
  });
}

/**
 * 下载为EXCEL
 * @param sql
 * @returns
 */
export async function downloadSqlJsonExcel(sql: string) {
  downloadFile(`/sql-json/export?type=excel&sql=${sql}`);
}

/**
 * 下载为CSV
 * @param widgetId
 * @returns
 */
export async function  downloadSqlJsonCSV(sql: string) {
  downloadFile(`/sql-json/export?type=csv&sql=${sql}`);
}

/** 同步tab顺序 */
export async function syncSqlJsonSeq(ids: string) {
  return request(`${API_PREFIX}/sql-json/seq`, {
    method: 'POST',
    data: {
      ids,
    },
  });
}