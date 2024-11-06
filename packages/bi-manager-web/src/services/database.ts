import { API_PREFIX } from '@/common';
import { IAjaxResponseFactory } from '@/interface';
import { EDatabaseType } from '@bi/common';
import { request } from 'umi';

export async function queryDabaseConfig() {
  const { success, data } = await request<
    IAjaxResponseFactory<{
      id?: string;
      type?: EDatabaseType;
      option?: string;
    }>
  >(`${API_PREFIX}/database/info`, {
    method: 'GET',
  });
  if (success) {
    return {
      id: data.id,
      datasource_type: data.type,
      option: JSON.parse(data.option || '{}'),
    };
  }
  return {}
}

export async function checkDabaseConnect() {
  const { success, data } = await request<
    IAjaxResponseFactory<boolean>
  >(`${API_PREFIX}/database/check`, {
    method: 'GET',
  });
  if (success) {
    return data
  }
  return false
}


export async function configDatabase(params: {
  id?: string;
  type: EDatabaseType;
  option: Record<string, any>;
}) {
  return request(`${API_PREFIX}/database/info`, {
    method: 'POST',
    data: {
      id: params.id,
      type: params.type,
      option: JSON.stringify(params.option || {}),
    },
  });
}
