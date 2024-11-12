import { BI_AUTH_TOKEN_KEY } from '@/common';
import { queryCurrentUserInfo } from '@/services/global';
import { login, register } from '@/services/users';
import { LockOutlined, MessageOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Card, Input, message, Modal } from 'antd';
import { Form } from 'antd';
import { useWatch } from 'antd/lib/form/Form';
import { useEffect, useState } from 'react';
import { history } from 'umi';
import styles from './index.less';

export default function Login() {
  const [form] = Form.useForm();
  const [isRegister, setRegister] = useState<boolean>(false);
  const password = useWatch('password', form);
  const handleLogin = async (values: any) => {
    if (isRegister) {
      const registerParams = {
        username: values.username,
        password: values.password,
        nickname: values.nickname,
        role: '111111',
        avator: '',
      };
      Modal.confirm({
        title: '确定注册账户吗？',
        centered: true,
        onOk: async () => {
          const { success } = await register(registerParams);
          if (success) {
            message.success('注册成功!');
            setRegister(false);
          } else {
            message.error('注册失败!');
          }
        },
      });
    } else {
      const { success, data } = await login({
        username: values.username,
        password: values.password,
      });
      if (success) {
        message.success('登录成功！');
        window.localStorage.setItem(BI_AUTH_TOKEN_KEY, data?.jwtToken);
        location.href = '/'
      }
    }
  };

  useEffect(() => {
    (async () => {
      const { success } = await queryCurrentUserInfo();
      if (success) {
        history.push('/')
      }
    })()
  }, [])

  return (
    <Card
      title={undefined}
      size="small"
      bodyStyle={{ padding: '2.5rem 3.5rem' }}
      className={styles['outer-card']}
    >
      <div className={styles['outer-card__title']}>
        {isRegister ? '注册账号' : '登录到 Generic BI'}
      </div>
      <Form form={form} layout="vertical" onFinish={handleLogin}>
        {isRegister ? (
          <>
            <Form.Item
              name="nickname"
              label="昵称"
              required={false}
              rules={[{ required: true, whitespace: true, message: '请输入您的昵称' }]}
            >
              <Input
                prefix={<MessageOutlined />}
                size="large"
                type="text"
                className={styles['outer-card__input']}
                style={{ borderColor: '#c1c1c191' }}
                placeholder="请输入昵称"
              />
            </Form.Item>
          </>
        ) : null}
        <Form.Item
          name="username"
          label="用户名"
          required={false}
          rules={[{ required: true, whitespace: true, message: '请输入您的用户名' }]}
        >
          <Input
            prefix={<UserOutlined />}
            size="large"
            type="text"
            className={styles['outer-card__input']}
            style={{ borderColor: '#c1c1c191' }}
            placeholder="请输入用户名"
          />
        </Form.Item>
        <Form.Item
          name="password"
          label="密码"
          required={false}
          rules={[{ required: true, whitespace: true, message: '请输入您的密码' }]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            size="large"
            type="text"
            className={styles['outer-card__input']}
            style={{ borderColor: '#c1c1c191' }}
            placeholder="请输入您的密码"
          />
        </Form.Item>
        {isRegister ? (
          <Form.Item
            name="re-password"
            label="确认密码"
            required={false}
            rules={[
              {
                validator: (rule: any, value: number, callback: (msg?: string) => void) => {
                  if (!value) {
                    return callback('请确认您的密码');
                  }
                  if (value !== password) {
                    return callback('两次输入密码不一致！');
                  }
                  callback();
                },
              },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              size="large"
              type="text"
              disabled={!password}
              className={styles['outer-card__input']}
              style={{ borderColor: '#c1c1c191' }}
              placeholder="请输入您的密码"
            />
          </Form.Item>
        ) : null}
        <Form.Item>
          <Button htmlType="submit" className={styles['outer-card__btn']}>
            {isRegister ? '注册' : ' 登录'}
          </Button>
        </Form.Item>
      </Form>
      <div
        className={styles['outer-card__bottom-tip']}
        onClick={() => {
          setRegister(!isRegister);
        }}
      >
        {isRegister ? '返回登录' : '没有账号？去注册'}
      </div>
    </Card>
  );
}
