import { DARK_COLOR, LIGHT_COLOR, updateTheme } from '@/utils/theme';
import { Avatar, Descriptions, message, Modal, Space, Switch, Tag } from 'antd';
import { useModel } from 'umi';
import { useEffect } from 'react';
import { isIframeEmbed } from '@/utils';
import { TTheme } from '@/interface';
import styles from './index.less';
import { UserOutlined } from '@ant-design/icons';
import AvatarDropdown from '../AvatarDropdown';
import Icon from '@ant-design/icons/lib/components/Icon';
import SUN_SVG from '../../assets/icons/sun.svg'
import MOON_SVG from '../../assets/icons/moon.svg'
import { queryOsInfo } from '@/services/global';
import { bytesToSize } from '@bi/common';

const RightContent = () => {
  const { initialState, setInitialState } = useModel('@@initialState');

  const handeChangeTheme = (checked: boolean) => {
    setInitialState({
      ...(initialState || {}),
      theme: !!checked ? 'dark' : 'light',
    });
  };

  useEffect(() => {
    window.addEventListener('message', (ev: MessageEvent<{ param: any }>) => { }, false);
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
      <Tag style={{ cursor: 'pointer' }} onClick={async () => {
        const { success, data: osInfo } = await queryOsInfo()
        if (!success) {
          return message.error('系统信息获取失败！')
        }
        Modal.info({
          title: `系统信息`,
          width: '600px',
          bodyStyle: {
            padding: '10px',
          },
          centered: true,
          icon: <></>,
          content: (
            <Descriptions bordered size="small" column={2} style={{ marginTop: '10px' }}>
              {Object.keys(osInfo).map((k) => (
                <Descriptions.Item label={k}>
                  {(()=>{
                    if(k === '总内存'||k==='可用内存'){
                      return bytesToSize(osInfo[k])
                    }
                    return osInfo[k]
                  })()}
                </Descriptions.Item>
              ))}
            </Descriptions>
          ),
        });
      }}>系统信息</Tag>
      <Switch
        checked={initialState?.theme === 'dark'}
        checkedChildren={<img width={14} src={MOON_SVG} />}
        unCheckedChildren={<img width={20} src={SUN_SVG} />}
        onChange={handeChangeTheme}
      />
      <AvatarDropdown />
    </Space>
  );
};

export default RightContent;
