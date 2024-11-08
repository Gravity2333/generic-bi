import { API_PREFIX } from '@/common';
import { IAjaxResponseFactory } from '@/interface';
import { IClickhouseColumn } from '@bi/common';
import { request } from 'umi';

/**
 * 查询 Clickhouse 统计中的所有的表
 */
export async function queryDatasources(database: string) {
  return request<IAjaxResponseFactory<any[]>>(`${API_PREFIX}/datasets`, {
    method: 'POST',
    data: {
      database,
    },
  });
}

/**
 * 查询 Clickhouse 某个表下的字段
 */
export async function queryDatasourcesColumns(database: string, tableName: string) {
  return request<IAjaxResponseFactory<IClickhouseColumn[]>>(`${API_PREFIX}/datasets/columns`, {
    method: 'POST',
    data: {
      database,
      tableName,
    },
  });
}
