import { checkDabaseConnect } from '@/services/database';
import { DisconnectOutlined, SmileOutlined } from '@ant-design/icons';
import { Alert, Button, Result } from 'antd';
import { useEffect, useState } from 'react';
import {history} from 'umi'

export default function Welcome() {
  const [connect, setConnect] = useState<boolean>(true);
  useEffect(() => {
    (async () => {
      setConnect((await checkDabaseConnect()) || false);
    })();
  }, []);
  console.log(connect);
  return (
    <>
      {!connect ? (
        <Alert
          icon={<DisconnectOutlined />}
          type="error"
          message="数据库连接失败，请检查配置！"
          style={{ margin: '20px', borderRadius: '10px' }}
          action={
            <Button size="small" type="link" onClick={()=>{
              history.push('/configuration/database')
            }}>
              去配置
            </Button>
          }
        />
      ) : null}
      <Result icon={<SmileOutlined />} title={`欢迎使用Generic-BI`} />
    </>
  );
}
