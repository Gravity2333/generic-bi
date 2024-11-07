import { DARK_COLOR, LIGHT_COLOR, updateTheme } from '@/utils/theme';
import { Avatar, Space, Switch, Tag } from 'antd';
import { useModel } from 'umi';
import { useEffect } from 'react';
import { isIframeEmbed } from '@/utils';
import { TTheme } from '@/interface';
import styles from './index.less';
import { UserOutlined } from '@ant-design/icons';
import AvatarDropdown from '../AvatarDropdown';

const RightContent = () => {
  const { initialState, setInitialState } = useModel('@@initialState');

  const handeChangeTheme = (checked: boolean) => {
    setInitialState({
      ...(initialState || {}),
      theme: !!checked ? 'dark' : 'light',
    });
  };

  useEffect(() => {
    window.addEventListener('message', (ev: MessageEvent<{ param: any }>) => {}, false);
  }, []);

  // 监听外层的容器的
  useEffect(() => {
    function watchStorage() {
      const parentTheme = (localStorage.getItem('theme') || 'light') as TTheme;
      if (parentTheme !== initialState?.theme) {
        setInitialState({
          ...(initialState || {}),
          theme: parentTheme,
        });
      }
    }

    // if (!isIframeEmbed) {
    //   return;
    // }

    window.addEventListener('storage', watchStorage);
    return () => {
      window.removeEventListener('storage', watchStorage);
    };
  }, [initialState?.theme]);

  // 先初始化一遍
  useEffect(() => {
    const isDark = initialState?.theme === 'dark';
    updateTheme(isDark, isDark ? DARK_COLOR : LIGHT_COLOR);
  }, [initialState?.theme]);

  // 微前端部署时，不显示主题配置
  if (isIframeEmbed) {
    return null;
  }

  return (
    <Space>
      <Tag>{'测试版本'}</Tag>
      <Switch
        checked={initialState?.theme === 'dark'}
        checkedChildren={'🌙'}
        unCheckedChildren={'🌝'}
        onChange={handeChangeTheme}
      />
      <AvatarDropdown/>
    </Space>
  );
};

export default RightContent;
