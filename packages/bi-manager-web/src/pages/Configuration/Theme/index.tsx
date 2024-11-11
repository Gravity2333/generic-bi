import { API_PREFIX, BI_AUTH_TOKEN_KEY } from '@/common';
import { getBackgroundUrls } from '@/services/layout';
import { PlusOutlined, PlusSquareOutlined, UploadOutlined } from '@ant-design/icons';
import { Button, Card, message, Upload } from 'antd';
import Meta from 'antd/lib/card/Meta';
import { useEffect, useState } from 'react';
const biToken = window.localStorage.getItem(BI_AUTH_TOKEN_KEY);
import styles from './index.less';

export default function Theme() {
  const [backgroundUrls, setBackgroundUrls] = useState<string[]>([]);

  const refreshUrls = async () => {
    const { success, data } = await getBackgroundUrls();
    if (success) {
      setBackgroundUrls(data);
    }
  };

  useEffect(() => {
    refreshUrls();
  }, []);

  return (
    <>
      <h2 style={{ width: '80%',margin:'20px auto'}}>选择背景图:</h2>
      <div className={styles['background-list']}>
        <Card
          style={{ width: '30%', height: '150px' }}
          hoverable
          bodyStyle={{
            height: '100%',
            textAlign: 'center',
            padding: '0px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Upload
            style={{ width: '100%', height: '100%', backgroundColor: 'red', display: 'block' }}
            {...{
              name: 'file',
              headers: {
                ...(biToken ? { Authorization: `Bearer ${biToken}` } : {}),
              },
              method: 'post',
              action: `${API_PREFIX}/background/as-import`,
              showUploadList: false,
              withCredentials: true,
              onChange(info) {
                if (info.file.status !== 'uploading') {
                  message.loading('上传中!');
                }
                if (info.file.status === 'done') {
                  message.destroy();
                  message.success(`上传完成!`);
                  refreshUrls();
                } else if (info.file.status === 'error') {
                  message.destroy();
                  message.error(`上传失败!`);
                }
              },
            }}
          >
            <PlusSquareOutlined
              style={{
                width: '100%',
                height: '100%',
                textAlign: 'center',
                fontSize: '40px',
                display: 'block',
              }}
            />
          </Upload>
        </Card>
        {backgroundUrls.map((backgroundUrl) => {
          return <Card hoverable cover={<img alt="example" src={backgroundUrl} />} />;
        })}
      </div>
    </>
  );
}
