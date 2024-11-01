import { BI_AUTH_TOKEN_KEY } from '@/common';
import useDynamicTheme from '@/hooks/useDynamicTheme';
import { PageLoading } from '@ant-design/pro-layout';
import { Result } from 'antd';
import React, { useEffect, useState } from 'react';
import { useLocation } from 'umi';

interface SecurityLayoutProps {
  children: React.ReactNode;
}

const SecurityLayout = ({ children }: SecurityLayoutProps) => {
  const location = useLocation();
  const [isReady, setIsReady] = useState(false);
  const [hasAuth, setHasAuth] = useState(false);

  useDynamicTheme()
  useEffect(() => {
    // 检查 token 值
    const token = sessionStorage.getItem(BI_AUTH_TOKEN_KEY);
    if (token) {
      setHasAuth(true);
    }
    setIsReady(true);
  }, [location.pathname]);

  if (!isReady) {
    return <PageLoading />;
  }

  if (!hasAuth) {
    return (
      <Result
        status="403"
        title={'没有权限访问'}
        subTitle={'抱歉，您无权访问该页面'}
      // extra={[
      //   <Button key="go-back" type="primary" onClick={() => history.goBack()}>
      //     返回上一级
      //   </Button>,
      //   <Button key="go-home" type="primary" onClick={() => history.replace('/')}>
      //     返回首页
      //   </Button>,
      // ]}
      />
    );
  }

  return children;
};

export default SecurityLayout;
