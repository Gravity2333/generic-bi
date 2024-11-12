import { LIGHT_COLOR, updateTheme } from '@/utils/theme';
import { Settings as LayoutSettings } from '@ant-design/pro-layout';
import { SHARE_PAGE_PREFIX } from '@bi/common';
import { notification, Skeleton } from 'antd';
import { RequestConfig, RunTimeLayoutConfig, useModel } from 'umi';
import { BI_AUTH_TOKEN_KEY } from './common';
import RightContent from './components/RightContent';
import { TTheme } from './interface';
import { isIframeEmbed, throttle } from './utils';
import { DARK_COLOR, THEME_KEY } from './utils/theme';
import { useEffect, useState } from 'react';
import { queryCurrentUserInfo } from './services/global';
import { sendMsgToParent } from './utils/sendMsgToParent';
import { getLayoutTitle } from './services/layout';
import { dynamicSetHeaderTitle, updateBackground } from './utils/layout';

export function getInitialState(): { theme: TTheme; settings?: Partial<LayoutSettings> } {
  const theme = (window.localStorage.getItem(THEME_KEY) as TTheme) || 'light';
  const isDark = theme === 'dark';
  // 初始化时先刷新一次主题
  updateTheme(isDark, isDark ? DARK_COLOR : LIGHT_COLOR);

  return {
    theme,
  };
}

function backToLogin() {
  if (!location.href?.includes('/login')) {
    // window.localStorage.removeItem(BI_AUTH_TOKEN_KEY);
    // location.href = '/login';
  }
}

function LayoutContent(children: JSX.Element) {
  const [loading, setLoading] = useState<boolean>(true);
  const { initialState, setInitialState } = useModel('@@initialState');

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { success, data } = await queryCurrentUserInfo();
      if (success) {
        setInitialState({
          ...(initialState || {}),
          currentUserInfo: data,
        } as any);
      } else {
        backToLogin();
      }
      setLoading(false);
    })();

    (async () => {
      const { success, data } = await getLayoutTitle();
      if (success&&data) {
        dynamicSetHeaderTitle(data);
        setInitialState({
          ...(initialState || {}),
          title: data,
        } as any);
      }
    })();

    updateBackground()
  }, []);

  if (window.location.pathname.includes(SHARE_PAGE_PREFIX)) {
    return children;
  }
  return (
    <>
      <Skeleton active loading={loading}>
        {children}
      </Skeleton>
    </>
  );
}
const unAuthorizedNotification = throttle(() => {
  if (!location.href?.includes('/login')) {
    notification.error({
      message: '没有权限访问',
      description: '抱歉，您无权访问该页面',
    });
    backToLogin();
    sendMsgToParent({ unAuthorize: true });
  }
}, 10000);

// ProLayout 支持的api https://procomponents.ant.design/components/layout
export const layout: RunTimeLayoutConfig = ({ initialState }) => {
  return {
    logo: true,
    navTheme: initialState?.theme === 'dark' ? 'realDark' : 'light',
    layout: 'top',
    primaryColor: initialState?.theme === 'dark' ? DARK_COLOR : LIGHT_COLOR,
    title: isIframeEmbed ? false : 'Generic-BI',
    className: isIframeEmbed ? 'embed-bi-layout' : undefined,
    isChildrenLayout: true,
    rightContentRender: () => <RightContent />,
    links: [],
    childrenRender: LayoutContent,
  };
};

/** 超时时间 10分钟 */
const REQUEST_TIME_OUT = 600000;

export const request: RequestConfig = {
  headers: (()=>{
    const biToken = window.localStorage.getItem(BI_AUTH_TOKEN_KEY);
    return biToken ? { Authorization: `Bearer ${biToken}` } : {}
  })() as any,
  timeout: REQUEST_TIME_OUT,
  errorHandler: (error: any) => {
    const { data } = error;
    // 授权失败
    if (error?.response?.status == 401) {
      unAuthorizedNotification();
      return data;
    }
    // 超时
    if (error?.type === 'Timeout') {
      notification.error({
        message: '查询超时',
        description: '查询超时，请调整查询范围',
      });
      return data;
    }
    const errorMsg = data?.message || '接口异常';
    if (errorMsg.includes('Code: 60. DB::Exception: Table fpc.t_fpc_flow_log_record')) {
      return data;
    }
    if (
      errorMsg.includes('Code: 394. DB::Exception: Query') ||
      errorMsg.includes('SyntaxError: Unexpected token C in JSON at')
    ) {
      return data;
    }
    notification.error({
      message: '请求错误',
      description: errorMsg,
    });
    return data;
  },
};
