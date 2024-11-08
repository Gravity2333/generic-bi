import { API_PREFIX } from '@/common';
import { IAjaxResponseFactory } from '@/interface';
import { DataBaseParsedType, DataBaseType, EDatabaseType } from '@bi/common';
import { request } from 'umi';

export async function queryDatabases() {
  return await request<IAjaxResponseFactory<DataBaseType[]>>(`${API_PREFIX}/database/list`, {
    method: 'GET',
  });
}

export async function queryDatabaseById(id: string) {
  return await request<IAjaxResponseFactory<DataBaseType>>(`${API_PREFIX}/database/${id}`, {
    method: 'GET',
  });
}

export async function checkDabaseConnect() {
  const { success, data } = await request<IAjaxResponseFactory<boolean>>(
    `${API_PREFIX}/database/check`,
    {
      method: 'GET',
    },
  );
  if (success) {
    return data;
  }
  return false;
}

export async function createDatabase(params: DataBaseParsedType) {
  return request(`${API_PREFIX}/database`, {
    method: 'POST',
    data: {
      id: params.id,
      name: params.name,
      type: params.type,
      readonly: params.readonly,
      option: JSON.stringify(params.option || {}),
    },
  });
}

export async function updateDatabase({ id, ...params }: DataBaseParsedType) {
  return request(`${API_PREFIX}/database/${id}`, {
    method: 'PUT',
    data: {
      id: id,
      name: params.name,
      type: params.type,
      readonly: params.readonly,
      option: JSON.stringify(params.option || {}),
    },
  });
}

export async function deleteDatabase(id: string) {
  return request<IAjaxResponseFactory<any>>(`${API_PREFIX}/database/${id}`, {
    method: 'DELETE',
  });
}
