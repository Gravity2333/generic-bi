import { API_PREFIX } from '@/common';
import { IAjaxResponseFactory } from '@/interface';
import { request } from 'umi';

export async function setLayoutTitle(title: string) {
  return request(`${API_PREFIX}/layout/title`, {
    method: 'POST',
    data: {
      title,
    },
  });
}

export async function getLayoutTitle() {
  return request(`${API_PREFIX}/layout/title`, {
    method: 'GET',
  });
}

export async function getBackgroundUrls() {
  return request(`${API_PREFIX}/background/urls`, {
    method: 'GET',
  });
}
export async function deleteBackground(path: string) {
  return request<IAjaxResponseFactory<any>>(`${API_PREFIX}/background`, {
    method: 'DELETE',
    data: {path}
  });
}


export async function setDefaultBackground(path: string) {
  return request(`${API_PREFIX}/default/background`, {
    method: 'POST',
    data: {
      path,
    },
  });
}

export async function getDefaultBackground() {
  return request(`${API_PREFIX}/default/background`, {
    method: 'GET',
  });
}