import { API_PREFIX, BI_AUTH_TOKEN_KEY } from '@/common';
import {
  CloseOutlined,
  EditOutlined,
  EllipsisOutlined,
  LogoutOutlined,
  SettingOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Avatar, Card, Menu, message, Modal, Spin, Tag, Upload } from 'antd';
import { useModel } from 'umi';
import HeaderDropdown from '../HeaderDropdown';
import styles from './index.less';
import Meta from 'antd/lib/card/Meta';
import { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import ChangePassword from '../ChangePassword';
import { backToLogin } from '@/utils';
import { queryCurrentUserInfo } from '@/services/global';
import EditableTitle from '../EditableTitle';
import { changeNickname } from '@/services/users';
import { history } from 'umi';
//@ts-ignore
import PINE_FOREST from "!!file-loader?name=static/[name].[ext]!../../assets/backgrounds/pine-forest.jpg"

export const LOGIN_OUT_KEY = 'loginOut';
const biToken = window.localStorage.getItem(BI_AUTH_TOKEN_KEY);

const UserInfoModal = forwardRef(function (
  {
    currentUserInfo: { username, nickname, avator = '' },
  }: {
    currentUserInfo: {
      username: string;
      nickname: string;
      role: string;
      avator?: string;
    };
  },
  ref,
) {
  const [visiable, setVisiable] = useState<boolean>(false);
  const [editMode, setEditMode] = useState<boolean>(false);
  useImperativeHandle(
    ref,
    () => {
      return {
        open: () => {
          setVisiable(true);
        },
      };
    },
    [],
  );

  const { setInitialState } = useModel('@@initialState');

  const fetchCurrentUserInfo = async () => {
    const { success, data } = await queryCurrentUserInfo();
    if (success) {
      setInitialState(
        (prev) =>
          ({
            ...(prev || {}),
            currentUserInfo: data,
          } as any),
      );
    } else {
      backToLogin();
    }
  };

  return (
    <Modal
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
        bodyStyle={{position:'relative'}}
        cover={
          <img
            alt="example"
            src={PINE_FOREST}
          />
        }
        actions={[
          <SettingOutlined
            key="setting"
            onClick={() => {
              history.push('/configuration');
            }}
          />,
          <EditOutlined
            key="edit"
            style={{
              color: editMode ? 'rgba(84,154,220,0.9)' : '',
            }}
            onClick={() => {
              setEditMode(!editMode);
            }}
          />,
          <CloseOutlined
            key="ellipsis"
            onClick={() => {
              setVisiable(false);
            }}
          />,
        ]}
      >
        <Meta
          avatar={
            <Upload
              style={{ width: '100%', height: '100%', backgroundColor: 'red', display: 'block' }}
              {...{
                name: 'file',
                headers: {
                  ...(biToken ? { Authorization: `Bearer ${biToken}` } : {}),
                },
                method: 'post',
                action: `${API_PREFIX}/avator/${username}/as-import`,
                showUploadList: false,
                withCredentials: true,
                onChange(info) {
                  if (info.file.status === 'done') {
                    message.destroy();
                    message.success(`上传完成!`);
                    setTimeout(() => {
                      fetchCurrentUserInfo();
                    }, 500);
                  } else if (info.file.status === 'error') {
                    message.destroy();
                    message.error(`上传失败!`);
                  }
                },
              }}
              beforeUpload={(file) => {
                const { name } = file;
                const allowTypes = /\.(jpg|jpeg|png|gif|svg|webp)$/i;
                if (!allowTypes.test(name)) {
                  message.destroy();
                  message.error('只能上传 JPG 或 PNG 文件!');
                  return false;
                }
                message.destroy();
                message.loading('上传中!');
                return true;
              }}
            >
              <Avatar style={{ cursor: 'pointer' }} src={`data:image/jpeg;base64,${avator}`} />
            </Upload>
          }
          title={
            <>
              <EditableTitle
                title={nickname}
                canEdit={editMode}
                editing={editMode}
                onSaveTitle={async (e) => {
                  if (!editMode) {
                    return;
                  }
                  const { success } = await changeNickname(e);
                  if (success) {
                    message.success('昵称更改成功！');
                    setTimeout(() => {
                      fetchCurrentUserInfo();
                    }, 500);
                  }
                }}
                showTooltip={false}
              ></EditableTitle>
              {editMode ? <Tag style={{position:'absolute',top:'-25px',right:'3px'}}>编辑模式</Tag> : ''}
            </>
          }
          description={`账户名：${username}`}
        />
      </Card>
    </Modal>
  );
});

function AvatarDropdown() {
  const { initialState } = useModel('@@initialState');
  // console.log(initialState);
  const changepasswdRef = useRef<any>();
  const ref = useRef<any>();
  const handleMenuClick = (info: any) => {
    const { key } = info;
    // 个人信息
    if (key === 'userInfo') {
      ref.current.open();
    }
    // 修改密码
    if (key === 'changePassword') {
      changepasswdRef.current.open();
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

  return (
    <>
      {true ? (
        <HeaderDropdown overlay={menuHeaderDropdown} placement="bottomRight">
          <span className={`${styles.action} ${styles.account}`}>
            <Avatar
              src={`data:image/jpeg;base64,${(initialState as any)?.currentUserInfo?.avator}`}
              size="small"
              icon={<UserOutlined />}
              style={{ marginRight: '10px', cursor: 'pointer' }}
            />
            <div className={`${styles.name} anticon`}>
              <span className="header-text">
                {(initialState as any)?.currentUserInfo?.nickname ||
                  (initialState as any)?.currentUserInfo?.fullname ||
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
      )}
      <ChangePassword
        ref={changepasswdRef}
        username={(initialState as any)?.currentUserInfo?.username}
      />
      <UserInfoModal ref={ref} currentUserInfo={(initialState as any).currentUserInfo || {}} />
    </>
  );
}

export default AvatarDropdown;
