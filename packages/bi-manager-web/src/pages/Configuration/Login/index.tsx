import { Form, InputNumber, Button, Modal, message } from 'antd';
import { useEffect } from 'react';
import { SettingOutlined } from '@ant-design/icons';
import { queryMailConfig } from '@/services/global';
import { getLoginTimeout, setLoginTimeout } from '@/services/users';
import { BI_AUTH_TOKEN_KEY } from '@/common';

/** SMTP表单参数 */
export interface ILoginForm {
  login_timeout_time: number;
}

const LoginConfig = () => {
  const [form] = Form.useForm();

  const handleSubmit = (params: ILoginForm) => {
    Modal.confirm({
      width: 500,
      title: '确定保存吗?',
      content: '修改登录超时时间需要重新登录！',
      icon: <SettingOutlined />,
      okText: '确定',
      centered: true,
      cancelText: '取消',
      onOk: async () => {
        const { success } = await setLoginTimeout(params['login_timeout_time']);
        if (success) {
          message.success('配置成功！');
          window.localStorage.removeItem(BI_AUTH_TOKEN_KEY);
          location.href = '/';
        }
      },
    });
  };

  useEffect(() => {
    (async () => {
      const { success, data } = await getLoginTimeout();
      if (success && data && Object.keys(data)?.length > 0) {
        form.setFieldsValue({
          login_timeout_time: data,
        });
      }
    })();
  }, []);

  return (
    <>
      <Form
        name="login-config-form"
        labelCol={{ span: 5 }}
        wrapperCol={{ span: 16 }}
        form={form}
        onFinish={handleSubmit}
        style={{ marginTop: 20 }}
      >
        <Form.Item
          label="登录超时时间"
          name="login_timeout_time"
          initialValue={60000}
          rules={[{ required: true, message: '必须填写超时时间' }]}
        >
          <InputNumber
            addonAfter={'MS'}
            min={60000}
            style={{ width: '100%' }}
            placeholder="请须填写超时时间 (最少为60000 [10分钟])"
          />
        </Form.Item>
        <Form.Item wrapperCol={{ offset: 5, span: 16 }}>
          <div style={{ display: 'flex', position: 'absolute', left: 0, marginTop: '20px' }}>
            <Button type="primary" htmlType="submit" style={{ marginRight: '10px' }}>
              保存
            </Button>
          </div>
        </Form.Item>
      </Form>
    </>
  );
};

export default LoginConfig;
