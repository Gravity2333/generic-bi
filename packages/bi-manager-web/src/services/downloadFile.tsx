import { request } from 'umi';
import { API_PREFIX } from '@/common';
import { message } from 'antd';
import { IAjaxResponseFactory } from '@/interface';
import { API_DOWNLOAD, AUTH_USER_COOKIE } from '@bi/common';

async function _getAuthCookieFromToken() {
  return request<IAjaxResponseFactory<void>>(`${API_PREFIX}/auth-cookie`, {
    method: 'GET',
  });
}

export async function downloadFile(
  url: string,
) {
  const authUserCookieValue = document.cookie?.split(';').find((key) => {
    return (key || '').split('=')[0]?.trim() === AUTH_USER_COOKIE
  })

  const { success: authCookieSuccess } = authUserCookieValue ? { success: true } : await _getAuthCookieFromToken()
  if (authCookieSuccess) {
    const link = document.createElement('a');
    link.style.display = 'none';
    link.href = `${API_PREFIX}${API_DOWNLOAD}${url}`;
    link.click();
    setTimeout(() => {
      document.cookie = "auth-user-cookie=;max-age=0;path=/"
      document.cookie = "auth-user-cookie.sig=;max-age=0;path=/"
    }, 2000);
  } else {
    message.error('您没有下载权限！')
  }

}
