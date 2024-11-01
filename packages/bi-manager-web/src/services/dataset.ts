import { API_PREFIX } from '@/common';
import { IAjaxResponseFactory } from '@/interface';
import { IClickhouseColumn, IClickhouseTable } from '@bi/common';
import { request } from 'umi';

/**
 * 查询 Clickhouse 统计中的所有的表
 */
export async function queryClichhouseTables() {
  return request<IAjaxResponseFactory<IClickhouseTable[]>>(`${API_PREFIX}/datasets`, {
    method: 'GET',
  });
}

/**
 * 查询 Clickhouse 某个表下的字段
 */
export async function queryClichhouseTableColumns(tableName: string) {
  return request<IAjaxResponseFactory<IClickhouseColumn[]>>(
    `${API_PREFIX}/datasets/${tableName}/columns`,
    {
      method: 'GET',
    },
  );
}

/** 查询是否有在线探针 */
export async function queryHasOnlineSnesor() {
  return request<IAjaxResponseFactory<IClickhouseTable[]>>(`${API_PREFIX}/online-sensor`, {
    method: 'GET',
  });
}
