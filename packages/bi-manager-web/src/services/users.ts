import { API_PREFIX } from '@/common';
import { IAjaxResponseFactory } from '@/interface';
import { EDatabaseType } from '@bi/common';
import { request } from 'umi';

export async function register(params: {
  username: string;
  password: string;
  nickname: string;
  avator?: string;
  role: string;
}) {
  return request(`${API_PREFIX}/register`, {
    method: 'POST',
    data: params,
  });
}

export async function login(params: {
  username: string;
  password: string;
}) {
  return request(`${API_PREFIX}/login`, {
    method: 'POST',
    data: params,
  });
}

