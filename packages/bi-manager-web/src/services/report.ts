import { API_PREFIX } from '@/common';
import { IAjaxResponseFactory } from '@/interface';
import { IReportFormData } from '@bi/common';
import { request } from 'umi';
import { IPageProps } from '.';
import { downloadFile } from './downloadFile';

interface IReportLogParams extends IPageProps {
  reportId: string;
}
/** 查询分页report */
export async function queryReports(params: IPageProps) {
  return request<IAjaxResponseFactory<IReportFormData[]>>(`${API_PREFIX}/reports`, {
    method: 'GET',
    params,
  });
}

/**  查询某个定时报表的执行日志（分页） */
export async function queryReportLogs({ reportId, ...params }: IReportLogParams) {
  return request<IAjaxResponseFactory<IReportFormData[]>>(
    `${API_PREFIX}/reports/${reportId}/job-logs`,
    {
      method: 'GET',
      params,
    },
  );
}

/** /reports/{reportId}/job-logs/{logId}/file-download */
/**
 * 下载日志
 * @param dashboardId
 * @returns
 */
export async function downloadLog(reportId: string, logId: string) {
  downloadFile(`/reports/${reportId}/job-logs/${logId}/file-download`);
}

/**
 * 查询 Report 详情
 * @param id ReportId
 * @returns
 */
export async function queryReportDetail(id: string) {
  return request<IAjaxResponseFactory<IReportFormData>>(`/reports/${id}`, {
    method: 'GET',
  });
}

/**
 * 新建 Report
 */
export async function createReport(reportFormData: Omit<IReportFormData, 'id'>) {
  return request<IAjaxResponseFactory<IReportFormData>>(`${API_PREFIX}/reports`, {
    method: 'POST',
    data: reportFormData,
  });
}

/**
 * 定时发送邮件
 */
export async function sendReportMail(id: string) {
  return request<IAjaxResponseFactory<IReportFormData>>(`${API_PREFIX}/reports/${id}/run`, {
    method: 'POST',
  });
}

/**
 * 编辑 Report
 */
export async function updateReport(reportFormData: IReportFormData) {
  const { id, ...rest } = reportFormData;
  return request<IAjaxResponseFactory<IReportFormData>>(`${API_PREFIX}/reports/${id}`, {
    method: 'PUT',
    data: rest,
  });
}

/**
 * 删除 Report
 * @param id ReportId
 * @returns
 */
export async function deleteReport(id: string) {
  return request<IAjaxResponseFactory<any>>(`${API_PREFIX}/reports/${id}`, {
    method: 'DELETE',
  });
}
