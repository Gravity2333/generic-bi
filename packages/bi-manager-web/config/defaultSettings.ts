import { TTheme } from '@/interface';
import { Settings as ProSettings } from '@ant-design/pro-layout';

type DefaultSettings = Partial<ProSettings> & {
  pwa: boolean;
  theme: TTheme;
};

const proSettings: DefaultSettings = {
  theme: 'light',
  navTheme: 'light',
  headerTheme: 'light',
  primaryColor: '#1890ff',
  layout: 'mix',
  contentWidth: 'Fluid',
  fixedHeader: true,
  fixSiderbar: true,
  title: '',
  pwa: false,
  iconfontUrl: '',
  splitMenus: false,
};

export type { DefaultSettings };

export default proSettings;
