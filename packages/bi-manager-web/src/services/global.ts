import { API_PREFIX } from '@/common';
import { IAjaxResponseFactory } from '@/interface';
import { IMailConfig, IUserInfo } from '@bi/common';
import { request } from 'umi';
import { stringify } from 'qs';
import { ITransmitSmtp } from '@/pages/Configuration/Mail';

/**
 * 查询邮箱配置
 */
export async function queryMailConfig() {
  return request<IAjaxResponseFactory<IMailConfig>>(`${API_PREFIX}/smtp-configuration`, {
    method: 'GET',
  });
}

/** 配置邮箱 */
export async function configMail(params: ITransmitSmtp) {
  return request<IAjaxResponseFactory<any>>(`${API_PREFIX}/smtp-configuration`, {
    method: 'POST',
    data:params,
  });
}

/** 检查smtp合法 */
export async function checkMailvalidate() {
  return request<IAjaxResponseFactory<IMailConfig>>(`${API_PREFIX}/smtp-configuration/check`, {
    method: 'GET',
  });
}

export async function checkMailByParams(params: ITransmitSmtp) {
  return request<IAjaxResponseFactory<any>>(`${API_PREFIX}/smtp-configuration/check-by-params`, {
    method: 'POST',
    data:params,
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
 * 查询自定义时间
 */
// export async function queryCustomTimes() {
//   return request<IAjaxResponseFactory<Record<string, ICustomTime>>>(`${API_PREFIX}/custom-times`, {
//     method: 'GET',
//   });
// }

/**
 * 查询用户信息
 */
export async function queryCurrentUserInfo() {
  return request<IAjaxResponseFactory<IUserInfo>>(`${API_PREFIX}/current-user`, {
    method: 'GET',
  });
}

/**
 * 查询详细用户信息
 */
export async function queryCurrentUserInfoDetails() {
  return request<IAjaxResponseFactory<IUserInfo>>(`${API_PREFIX}/current-user-details`, {
    method: 'GET',
  });
}

/**
 * 查询os信息
 */
export async function queryOsInfo() {
  return request<IAjaxResponseFactory<any>>(`${API_PREFIX}/os-info`, {
    method: 'GET',
  });
}