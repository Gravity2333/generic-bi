import { API_PREFIX } from '@/common';
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
