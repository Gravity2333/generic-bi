const biToken = window.localStorage.getItem(BI_AUTH_TOKEN_KEY);
import { BI_AUTH_TOKEN_KEY } from '@/common';
import { message } from 'antd';

export async function downloadFile(
  url: string,
  onProgress?: (progress: number) => void,
  onError?: (code: string | number) => void,
): Promise<boolean> {
  return await new Promise((resolve) => {
    fetch(url, {
      headers: {
        ...(biToken ? { Authorization: `Bearer ${biToken}` } : {}),
      },
    })
      .then(async (res) => {
        if (res.status >= 200 && res.status < 300) {
          const headers = res.headers;
          const ContentType = headers.get('Content-Type')?.split(';')[0];
          if (ContentType === 'application/json') {
            return res.json();
          }

          const ContentDisposition = headers.get('Content-Disposition');
          const filename = ContentDisposition?.split(';')[1]?.split('=')[1];
          // 获取reader
          const reader = res.body?.getReader();
          // 获取content-length
          const total = res.headers.get('content-length') || 0;
          // 定义已加载数据长度
          let loaded = 0;
          // 定义数据
          let data = new Blob();
          while (true) {
            const { done, value } = await reader!.read();
            const newBlob = new Blob([value!]);

            if (done) {
              const link = document.createElement('a');
              link.style.display = 'none';
              link.href = URL.createObjectURL(data);
              link.download = decodeURIComponent(filename!);
              document.body.appendChild(link);
              link.click();
              URL.revokeObjectURL(link.href);
              document.body.removeChild(link);
              return true;
            }
            loaded += value.length;
            data = new Blob([await data.arrayBuffer(), await newBlob.arrayBuffer()], {
              type: ContentType,
            });

            if (!total || (total && +total === 0)) {
              if (onProgress) {
                onProgress(100);
              }
            } else {
              const progress = +((loaded / +total!) * 100).toFixed(0);
              if (onProgress) {
                onProgress(progress);
              }
            }
          }
        } else {
          return false;
        }
      })
      .then((res) => {
        if (typeof res === 'boolean'&&res) {
          resolve(res);
          message.success('下载成功！')
          return
        }

        if (res.result == '2' || res.result == '0') {
          if (onError) {
            onError(res.result);
          }
          resolve(false);
        }

        resolve(false);
        message.error('下载失败！')
      })

      .finally(() => resolve(false));
  });
}
