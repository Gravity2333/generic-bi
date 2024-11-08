import { BI_AUTH_TOKEN_KEY } from '@/common';
import { CloseOutlined, EditOutlined, EllipsisOutlined, LogoutOutlined, SettingOutlined, UserOutlined } from '@ant-design/icons';
import { Avatar, Card, Menu, Modal, Spin } from 'antd';
import { useModel } from 'umi';
import HeaderDropdown from '../HeaderDropdown';
import styles from './index.less';
import Meta from 'antd/lib/card/Meta';
import { forwardRef, useImperativeHandle, useRef, useState } from 'react';

export const LOGIN_OUT_KEY = 'loginOut';

const UserInfoModal = forwardRef(function ({ currentUserInfo: {
  username,
  fullname,
  role,
} }: {
  currentUserInfo: {
    username: string,
    fullname: string,
    role: string,
  }
}, ref) {
  const [visiable, setVisiable] = useState<boolean>(false)

  useImperativeHandle(ref, () => {
    return {
      open: () => {
        setVisiable(true)
      }
    }
  }, [])

  return <Modal
    visible={visiable}
    footer={null}
    destroyOnClose
    title={undefined}
    onCancel={() => {
      setVisiable(false);
    }}
    centered
    width={300}
    closable={false}
    bodyStyle={{ padding: '0px' }}
  >
    <Card
      style={{ width: 300 }}
      cover={
        <img
          alt="example"
          src="https://gw.alipayobjects.com/zos/rmsportal/JiqGstEfoWAOHiTxclqi.png"
        />
      }
      actions={[
        <SettingOutlined key="setting" />,
        <EditOutlined key="edit" />,
        <CloseOutlined key="ellipsis" onClick={() => { setVisiable(false) }} />,
      ]}
    >
      <Meta
        avatar={<Avatar src="https://api.dicebear.com/7.x/miniavs/svg?seed=8" />}
        title={fullname}
        description={`账户名：${username}`}
      />
    </Card>
  </Modal>
})

function AvatarDropdown() {
  const { initialState } = useModel('@@initialState');
  console.log(initialState)
  const ref = useRef<any>()
  const handleMenuClick = (info: any) => {
    const { key } = info;
    // 个人信息
    if (key === 'userInfo') {
      ref.current.open()
    }
    // 修改密码
    if (key === 'changePassword') {
    }

    if (key === 'logout') {
      Modal.confirm({
        title: '确定退出登录吗?',
        icon: <LogoutOutlined />,
        closable: true,
        centered: true,
        onOk: async () => {
          window.localStorage.setItem(BI_AUTH_TOKEN_KEY, '');
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

  return <>
    {
      true ? (
        <HeaderDropdown overlay={menuHeaderDropdown} placement="bottomRight">
          <span className={`${styles.action} ${styles.account}`}>
            <Avatar src="https://api.dicebear.com/7.x/miniavs/svg?seed=8" size="small" icon={<UserOutlined />} style={{ marginRight: '10px', cursor: 'pointer' }} />
            <div className={`${styles.name} anticon`}>
              <span className="header-text">
                {(initialState as any)?.currentUserInfo?.fullname ||
                  (initialState as any)?.currentUserInfo?.username ||
                  '未知用户'}
              </span>
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
      )
    }
    <UserInfoModal ref={ref} currentUserInfo={(initialState as any).currentUserInfo||{}} />
  </>
}

export default AvatarDropdown;
