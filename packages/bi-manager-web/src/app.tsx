import { LIGHT_COLOR, updateTheme } from '@/utils/theme';
import { Settings as LayoutSettings } from '@ant-design/pro-layout';
import { SHARE_PAGE_PREFIX } from '@bi/common';
import { notification, Skeleton } from 'antd';
import { RequestConfig, RunTimeLayoutConfig, useModel } from 'umi';
import { BI_AUTH_TOKEN_KEY } from './common';
import RightContent from './components/RightContent';
import { TTheme } from './interface';
import { backToLogin, isIframeEmbed, throttle } from './utils';
import { DARK_COLOR, THEME_KEY } from './utils/theme';
import { useEffect, useMemo, useState } from 'react';
import { queryCurrentUserInfo, queryCurrentUserInfoDetails } from './services/global';
import { sendMsgToParent } from './utils/sendMsgToParent';
import { getLayoutTitle } from './services/layout';
import { dynamicSetHeaderTitle, updateBackground } from './utils/layout';
import ProjectInfo from './components/ProjectInfo';

export function getInitialState(): { theme: TTheme; settings?: Partial<LayoutSettings> } {
  const theme = (window.localStorage.getItem(THEME_KEY) as TTheme) || 'light';
  const isDark = theme === 'dark';
  // 初始化时先刷新一次主题
  updateTheme(isDark, isDark ? DARK_COLOR : LIGHT_COLOR);

  return {
    theme,
  };
}

function LayoutContent(children: JSX.Element) {
  const [loading, setLoading] = useState<boolean>(true);
  const { initialState, setInitialState } = useModel('@@initialState');

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { success } = await queryCurrentUserInfo();
      if (!success) {
        backToLogin();
      }
      setLoading(false);
    })();

    (async () => {
      const { success, data } = await queryCurrentUserInfoDetails();
      if (success) {
        setInitialState(
          (prev) =>
          ({
            ...(prev || {}),
            currentUserInfo: data,
          } as any),
        );
      }
    })();

    (async () => {
      const { success, data } = await getLayoutTitle();
      if (success && data) {
        dynamicSetHeaderTitle(data);
        setInitialState(
          (prev) =>
          ({
            ...(prev || {}),
            title: data,
          } as any),
        );
      }
    })();
  }, []);

  if (window.location.pathname.includes(SHARE_PAGE_PREFIX)) {
    return children;
  }

  const [themeColor, infoColor] = useMemo(() => {
    const { palette = [], background } = (initialState as any)?.currentUserInfo?.themeColor || {};
    updateBackground(background || './assets/backgrounds/bridge.svg');

    return palette[1]
      ? [palette[2], palette[3]]
      : ['rgba(84,154,220,0.9)', 'rgba(84,154,220,0.9)'];
  }, [initialState]);

  return (
    <>
      <style>
        {`
          :root{
             --ant-primary-color: ${themeColor} !important;
             --ant-info-color: ${infoColor} !important;
          }
        `}
      </style>
      <ProjectInfo />
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
    logo: false,
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
  headers: (() => {
    const biToken = window.localStorage.getItem(BI_AUTH_TOKEN_KEY);
    return biToken ? { Authorization: `Bearer ${biToken}` } : {};
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
