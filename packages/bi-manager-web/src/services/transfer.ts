import { API_PREFIX, BI_AUTH_TOKEN_KEY } from '@/common';
import { IAjaxResponseFactory } from '@/interface';
import { IWidgetFormData } from '@bi/common';
import { message } from 'antd';
import { request } from 'umi';

const biToken = window.localStorage.getItem(BI_AUTH_TOKEN_KEY);
export function uploadFile({
  url,
  file,
  onProgress = () => { },
  onLoadStart = () => { },
  onLoadEnd = () => { },
  onError = () => { }
}: {
  url: string,
  file: File,
  onProgress?: (progress: number) => void
  onLoadStart?: () => void
  onLoadEnd?: () => void
  onError?: () => void
}): [Promise<{
  success: boolean,
}>, () => void] {

  if (!file) {
    message.error('没有选择文件')
    return [Promise.resolve({ success: false }), () => { }]
  }

  const xhr = new XMLHttpRequest()
  return [new Promise((resolve) => {
    const formData = new FormData()
    formData.append('file', file)

    xhr.upload.onloadstart = () => {
      onLoadStart()
    }

    xhr.upload.onprogress = ({ loaded, total }) => {
      onProgress(+(loaded / total).toFixed(2))
    }


    xhr.upload.onloadend = () => {
      onLoadEnd()
      resolve({ success: true })
    }

    xhr.upload.onerror = () => {
      debugger
      resolve({
        success: false,
      })
    }

    xhr.onerror = () => {
      onError()
    }

    xhr.onreadystatechange = () => {
      try{
        if (xhr.readyState == 4) {
          if (xhr.status.toString().startsWith('5')) {
            resolve({ success: false })
          }
        }
      }catch(e){}
    }

    xhr.open('POST', url)

    /** 设置token */
    if (biToken) {
      xhr.setRequestHeader('Authorization', `Bearer ${biToken}`)
    }
    xhr.send(formData)
  }), ()=>{
    xhr.abort()
  }] as [Promise<{
    success: boolean,
  }>, () => void]
}

/**
 *
 * 取消所有查询
 */
export async function cancelAllQuery() {
  return request<IAjaxResponseFactory<IWidgetFormData>>(`${API_PREFIX}/slow-queries/cancelAll`, {
    method: 'POST',
  });
}