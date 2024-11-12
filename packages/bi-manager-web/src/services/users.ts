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

export async function login(params: { username: string; password: string }) {
  return request(`${API_PREFIX}/login`, {
    method: 'POST',
    data: params,
  });
}

export async function setLoginTimeout(timeout: number) {
  return request(`${API_PREFIX}/login/timeout`, {
    method: 'POST',
    data: {
      timeout,
    },
  });
}

export async function getLoginTimeout() {
  return request(`${API_PREFIX}/login/timeout`, {
    method: 'GET',
  });
}

export async function changePassword(params: { username: string; password: string,oldPassword: string; }) {
  return request(`${API_PREFIX}/change-password`, {
    method: 'POST',
    data: params,
  });
}

export async function changeNickname(nickname: string) {
  return request(`${API_PREFIX}/change-nickname`, {
    method: 'POST',
    data: {nickname},
  });
}


