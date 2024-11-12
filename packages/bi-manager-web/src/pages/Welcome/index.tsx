import { checkDabaseConnect } from '@/services/database';
import { DisconnectOutlined, SmileOutlined } from '@ant-design/icons';
import { Alert, Button, Card, Result } from 'antd';
import { useEffect, useState } from 'react';
import { history, useModel } from 'umi';
import styles from './index.less';

export default function Welcome() {
  // const [connect, setConnect] = useState<boolean>(true);
  // useEffect(() => {
  //   (async () => {
  //     setConnect((await checkDabaseConnect()) || false);
  //   })();
  // }, []);
  const { initialState } = useModel('@@initialState');
  return (
    <>
      {/* {!connect ? (
        <Alert
          icon={<DisconnectOutlined />}
          type="error"
          message="数据库连接失败，请检查配置！"
          style={{ margin: '20px', borderRadius: '10px' }}
          action={
            <Button
              size="small"
              type="link"
              onClick={() => {
                history.push('/configuration/database');
              }}
            >
              去配置
            </Button>
          }
        />
      ) : null} */}
      <Result icon={<SmileOutlined style={{ color: 'rgba(84,154,220,0.9)' }} />} title={'欢迎使用'+(initialState as any)?.title || `Generic-BI`} />
      <div className={styles['show-bar']}>
        <div
          className={`${styles['show-bar__card']} ${styles['show-bar__card__db-cover']}`}
          title={undefined}
          onClick={() => {
            history.push('/configuration/database');
          }}
        >
          <h3>还没配置数据库？</h3>
          <span>去配置</span>
        </div>
        <div
          className={`${styles['show-bar__card']} ${styles['show-bar__card__widget-cover']}`}
          title={undefined}
          onClick={() => {
            history.push('/widget/create');
          }}
        >
          <h3>开始第一个图表！</h3>
          <span>去创建</span>
        </div>
        <div
          className={`${styles['show-bar__card']} ${styles['show-bar__card__dashboard-cover']}`}
          title={undefined}
          onClick={() => {
            history.push('/dashboard/create');
          }}
        >
          <h3>批量展示！</h3>
          <span>去拖拽</span>
        </div>
        <div
          className={`${styles['show-bar__card']} ${styles['show-bar__card__mail-cover']}`}
          title={undefined}
          onClick={() => {
            history.push('/report/create');
          }}
        >
          <h3>立刻通知！</h3>
          <span>去发送</span>
        </div>
      </div>
    </>
  );
}
