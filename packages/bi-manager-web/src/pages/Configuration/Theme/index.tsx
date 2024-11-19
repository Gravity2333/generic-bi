import { API_PREFIX, BI_AUTH_TOKEN_KEY } from '@/common';
import { deleteBackground, getBackgroundUrls } from '@/services/layout';
import { CloudUploadOutlined } from '@ant-design/icons';
import { Button, Card, message, Progress, Upload } from 'antd';
import Meta from 'antd/lib/card/Meta';
import { useEffect, useRef, useState } from 'react';
const biToken = window.localStorage.getItem(BI_AUTH_TOKEN_KEY);
import styles from './index.less';
import { changeBackground } from '@/utils/layout';
import { __DEFAULT_BACKGROUNDS__ } from '@/assets/backgrounds/desc';
import useCurrentUserInfo from '@/hooks/useCurrentInfo';
import { uploadFile } from '@/services/transfer';
import GlobalAlert from '@/components/GlobalAlert';
import { flushSync } from 'react-dom';

export default function Theme() {
  const alertRef = useRef<any>()
  const abortRef = useRef<any>()
  const [backgroundUrls, setBackgroundUrls] = useState<string[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number>(0)
  const [, reload] = useCurrentUserInfo()
  const refreshUrls = async () => {
    const { success, data } = await getBackgroundUrls();
    if (success) {
      setBackgroundUrls(data);
    }
  };

  useEffect(() => {
    refreshUrls();
  }, []);

  const startProcess = () => {
    flushSync(() => {
      setUploadProgress(0)
    })
    alertRef.current.on()
  }

  const [msg, setMsg] = useState<any>('')

  const changeProcess = (p: number) => {
    setUploadProgress(+(p * 100).toFixed(0))
  }

  const endProcess = () => {
    setUploadProgress(100)
    setMsg('上传成功！')
    setTimeout(() => {
      alertRef.current.off()
      setTimeout(() => {
        setMsg('')
      }, 1000);
    }, 2000);
  }

  const errProcess = () => {
    setUploadProgress(100)
    setMsg('上传失败！')
    setTimeout(() => {
      alertRef.current.off()
      setTimeout(() => {
        setMsg('')
      }, 1000);
    }, 2000);
  }

  return (
    <>
      <GlobalAlert onClose={() => {
        abortRef.current?.()
      }} ref={alertRef} ><div style={{ fontSize: '12px', lineHeight: '30px', textAlign: 'center' }}>
          {
            !msg ? <> <span style={{ marginRight: '10px' }}>上传进度</span>
              <Progress percent={uploadProgress} steps={10} /></> : <span>{msg}</span>
          }
        </div></GlobalAlert>
      <div className={styles['background-list']}>
        <Card
          style={{ width: ' 300px', height: '350px', cursor: 'pointer' }}
          hoverable
          bodyStyle={{
            height: '100%',
            textAlign: 'center',
            padding: '0px',
            display: 'flex',
            flexFlow: 'column nowrap',
            justifyContent: 'center',
            alignItems: 'center',
            cursor: 'pointer'
          }}
        >
          <input className={styles['upload']} type='file' accept=".jpg, .jpeg, .png, .gif .svg .webp" onChange={async (e) => {
            if (e.target.files?.[0]) {
              const [uploadPromise, abort] = uploadFile({
                file: e.target.files[0]!,
                url: `${API_PREFIX}/background/as-import`,
                onLoadStart: startProcess,
                onProgress: changeProcess,
                onLoadEnd: endProcess,
                onError: errProcess,
              })

              abortRef.current = abort
              const { success } = await uploadPromise

              if (success) {
                endProcess()
                refreshUrls()
              } else {
                errProcess()
              }
            }
          }} />
          <CloudUploadOutlined
            style={{
              textAlign: 'center',
              fontSize: '70px',
              display: 'block',
            }}
          />
          <div>背景上传</div>
        </Card>
        {__DEFAULT_BACKGROUNDS__.map(({ name, path, cover }: any) => {
          return (
            <Card hoverable cover={<img width={350} height={250} alt="example" src={cover} />}>
              <Meta
                title={name}
                description={
                  <>
                    <Button
                      size="small"
                      type="link"
                      onClick={async () => {
                        await changeBackground(path);
                        reload()
                      }}
                    >
                      设置为背景
                    </Button>
                  </>
                }
              />
            </Card>
          );
        })}
        {backgroundUrls.map((backgroundUrl) => {
          return (
            <Card
              hoverable
              cover={<img width={350} height={250} alt="example" src={backgroundUrl} />}
            >
              <Meta
                title={
                  <Button
                    size="small"
                    type="link"
                    onClick={() => {
                      changeBackground(backgroundUrl);
                    }}
                  >
                    设置为背景
                  </Button>
                }
                description={
                  <Button
                    size="small"
                    type="link"
                    danger
                    onClick={() => {
                      (async () => {
                        const { success } = await deleteBackground(backgroundUrl);
                        if (success) {
                          message.success('删除素材成功！');
                          refreshUrls();
                        }
                      })();
                    }}
                  >
                    删除素材
                  </Button>
                }
              />
            </Card>
          );
        })}
      </div>
    </>
  );
}
