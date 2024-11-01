import { API_PREFIX } from '@/common';
import { IAjaxResponseFactory } from '@/interface';
import { INetworkInfoType } from '@bi/common';
import { request } from 'umi';

/**
 * 查询 网络信息
 */
export async function queryNetworkInfos() {
  return request<IAjaxResponseFactory<INetworkInfoType>>(`${API_PREFIX}/network/info`, {
    method: 'GET',
  });
}
