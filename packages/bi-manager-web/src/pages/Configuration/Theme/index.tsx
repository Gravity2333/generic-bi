import { API_PREFIX, BI_AUTH_TOKEN_KEY } from '@/common';
import { deleteBackground, getBackgroundUrls } from '@/services/layout';
import { PlusSquareOutlined } from '@ant-design/icons';
import { Button, Card, message, Upload } from 'antd';
import Meta from 'antd/lib/card/Meta';
import { useEffect, useState } from 'react';
const biToken = window.localStorage.getItem(BI_AUTH_TOKEN_KEY);
import styles from './index.less';
import { changeBackground } from '@/utils/layout';
import { __DEFAULT_BACKGROUNDS__ } from '@/assets/backgrounds/desc';

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
      <h2 style={{ width: '80%', margin: '20px auto' }}>选择背景图:</h2>
      <div className={styles['background-list']}>
        <Card
          style={{ width: ' 300px', height: '350px' }}
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
            beforeUpload={(file) => {
              const { name } = file;
              const allowTypes = /\.(jpg|jpeg|png|gif|svg|webp)$/i;
              if (!allowTypes.test(name)) {
                message.destroy();
                message.error('只能上传 JPG 或 PNG 文件!');
                return false;
              }
              message.destroy();
              message.loading('上传中!');
              return true;
            }}
          >
            <PlusSquareOutlined
              style={{
                width: '100%',
                height: '100%',
                textAlign: 'center',
                fontSize: '70px',
                display: 'block',
              }}
            />
          </Upload>
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
                      onClick={() => {
                        changeBackground(path);
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
