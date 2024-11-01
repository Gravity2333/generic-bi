import { API_PREFIX } from '@/common';
import { IAjaxResponseFactory } from '@/interface';
import { ICustomTime, IMailConfig, IUserInfo } from '@bi/common';
import { request } from 'umi';
import { stringify } from 'qs';

/**
 * 查询邮箱配置
 */
export async function queryMailConfig() {
  return request<IAjaxResponseFactory<IMailConfig>>(`${API_PREFIX}/mail-configs`, {
    method: 'GET',
  });
}

/**
 * 查询活跃IP资产
 */
export async function queryActiveAssets({
  from,
  to,
  queryId,
}: {
  from: number;
  to: number;
  queryId: string;
}) {
  return request<IAjaxResponseFactory<string>>(
    `${API_PREFIX}/active-assets?from=${from}&to=${to}&queryId=${queryId}`,
    {
      method: 'GET',
    },
  );
}

/**
 * 查询新发现IP资产
 */
export async function queryNewFoundedAssets({
  from,
  to,
  queryId,
}: {
  from: number;
  to: number;
  queryId: string;
}) {
  return request<IAjaxResponseFactory<string>>(
    `${API_PREFIX}/new-found-assets?from=${from}&to=${to}&queryId=${queryId}`,
    {
      method: 'GET',
    },
  );
}

/**
 * 查询告警
 */
export async function queryAlarms({ from, to }: { from: string; to: string }) {
  return request<IAjaxResponseFactory<any>>(`${API_PREFIX}/alarm?${stringify({ from, to })}`, {
    method: 'GET',
  });
}

/**
 * 查询BI版本
 */
export async function queryBiVersion() {
  return request<IAjaxResponseFactory<any>>(`${API_PREFIX}/bi-version`, {
    method: 'GET',
  });
}

/**
 * 查询自定义时间
 */
export async function queryCustomTimes() {
  return request<IAjaxResponseFactory<Record<string, ICustomTime>>>(`${API_PREFIX}/custom-times`, {
    method: 'GET',
  });
}

/**
 * 查询用户信息
 */
export async function queryCurrentUserInfo(token: string) {
  return request<IAjaxResponseFactory<IUserInfo>>(`${API_PREFIX}/current-user?token=${token}`, {
    method: 'GET',
  });
}
