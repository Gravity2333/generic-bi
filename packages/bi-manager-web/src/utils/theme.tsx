import { disable as darkreaderDisable, enable as darkreaderEnable } from '@umijs/ssr-darkreader';
import { ConfigProvider } from 'antd';

export const THEME_KEY = 'bi-theme';
export const DARK_COLOR = '#1890ff';
export const LIGHT_COLOR = '#1890ff';

export const updateTheme = async (dark: boolean, color?: string) => {
  if (typeof window === 'undefined') return;
  if (typeof window.MutationObserver === 'undefined') return;

  // 刷新theme
  window.localStorage.setItem(THEME_KEY, dark ? 'dark' : 'light');

  if (!ConfigProvider.config) return;
  ConfigProvider.config({
    theme: {
      primaryColor: color || DARK_COLOR,
    },
  });

  if (dark) {
    if (window.MutationObserver)
      darkreaderEnable(
        {
          brightness: 100,
          contrast: 90,
          sepia: 10,
          darkSchemeBackgroundColor: '#141414',
          darkSchemeTextColor: 'rgba(255, 255, 255, 0.8)',
        },
        {
          invert: [],
          css: '',
          ignoreInlineStyle: ['.react-switch-handle', '.ant-checkbox *', '.echarts-for-react *'],
          ignoreImageAnalysis: [],
          disableStyleSheetsProxy: true,
        },
      );
  } else {
    if (window.MutationObserver) darkreaderDisable();
  }
};
