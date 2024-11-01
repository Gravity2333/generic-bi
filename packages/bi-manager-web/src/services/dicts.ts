import { API_PREFIX } from '@/common';
import { request } from 'umi';

export interface IDictMappingParams {
  id?: string;
  table_name: string;
  table_field: string;
  dict_field: string;
}
/**
 * 查询所有字典
 */
export async function queryAllDicts(forceFlush: number = 0) {
  return request(`${API_PREFIX}/npmd/dicts?forceFlush=${forceFlush}`, {
    method: 'GET',
  });
}

/**
 * 查询 表下的字典映射关系
 */
export async function queryDictMappings(table_name: string) {
  return request(`${API_PREFIX}/npmd/dict-mappings?table_name=${table_name}`, {
    method: 'GET',
  });
}

/**
 * 查询 网络组
 */
export async function queryNetworkGroups() {
  return request(`${API_PREFIX}/npmd/dicts/network-groups`, {
    method: 'GET',
  });
}

/**
 * 新建 字典映射关系
 */
export async function createDictMapping(params: IDictMappingParams) {
  return request(`${API_PREFIX}/npmd/dict-mappings`, {
    method: 'POST',
    data: params,
  });
}

/**
 * 编辑 字典映射关系
 */
export async function updateDictMapping(params: IDictMappingParams) {
  const { id, ...rest } = params;
  return request(`${API_PREFIX}/npmd/dict-mappings/${id}`, {
    method: 'PUT',
    data: rest,
  });
}

/**
 * 删除 字典映射关系
 */
export async function deleteDictMapping(id: string) {
  return request(`${API_PREFIX}/npmd/dict-mappings/${id}`, {
    method: 'DELETE',
  });
}
