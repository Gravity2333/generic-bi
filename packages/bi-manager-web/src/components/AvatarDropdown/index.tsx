import { BI_AUTH_TOKEN_KEY } from '@/common';
import { LogoutOutlined, SettingOutlined, UserOutlined } from '@ant-design/icons';
import { Avatar, Menu, Modal, Spin } from 'antd';
import HeaderDropdown from '../HeaderDropdown';
import styles from './index.less';

export const LOGIN_OUT_KEY = 'loginOut';

function AvatarDropdown() {
  const handleMenuClick = (info: any) => {
    const { key } = info;
    // 个人信息
    if (key === 'userInfo') {
    }
    // 修改密码
    if (key === 'changePassword') {
    }

    if (key === 'logout') {
      Modal.confirm({
        title: '确定退出登录吗?',
        closable: true,
        onOk: async () => {
          window.sessionStorage.setItem(BI_AUTH_TOKEN_KEY, '');
          location.href = '/login';
        },
      });
    }
  };

  const menuHeaderDropdown = (
    <Menu className={styles.menu} onClick={handleMenuClick} key="avatar-menu">
      <Menu.Item key="userInfo">
        <UserOutlined />
        个人信息
      </Menu.Item>
      <Menu.Item key="changePassword">
        <SettingOutlined />
        修改密码
      </Menu.Item>
      <Menu.Divider key="divider" />

      <Menu.Item key="logout">
        <LogoutOutlined />
        退出登录
      </Menu.Item>
    </Menu>
  );

  return true ? (
    <HeaderDropdown overlay={menuHeaderDropdown} placement="bottomRight">
      <span className={`${styles.action} ${styles.account}`}>
        <Avatar size="small" icon={<UserOutlined />} />
        <div className={`${styles.name} anticon`}>
          <span className="header-text">{'fullname'}</span>
        </div>
      </span>
    </HeaderDropdown>
  ) : (
    <span className={`${styles.action} ${styles.account}`}>
      <Spin
        size="small"
        style={{
          marginLeft: 8,
          marginRight: 8,
        }}
      />
    </span>
  );
}

export default AvatarDropdown;
