import { Form, Input, InputNumber, Select, Button, Col, Modal, message } from 'antd';
import { useEffect, useState } from 'react';
import { SettingOutlined } from '@ant-design/icons';
import Privacy from '@/components/Privacy';
import { validateMail } from '@/utils/validator';
import { checkMailByParams, configMail, queryMailConfig } from '@/services/global';

/** SMTP表单参数 */
export interface ITransmitSmtp {
  id?: string;
  mailUsername: string;
  mailAddress: string;
  smtpServer: string;
  serverPort: number;
  /** (0-否；1-是) */
  encrypt: 0 | 1;
  loginUser: string;
  loginPassword: string;
}

const { Option } = Select;
const MaiLConfig = () => {
  const [form] = Form.useForm();
  const [checkPrivacy, setCheckPrivacy] = useState(false);

  const handleSubmit = (params: ITransmitSmtp) => {
    Modal.confirm({
      width: 500,
      title: '确定保存吗?',
      icon: <SettingOutlined />,
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        const { success } = await configMail(params);
        if (success) {
          message.success('配置成功！');
        }
      },
    });
  };

  useEffect(() => {
    (async () => {
      const { success, data } = await queryMailConfig();
      if (success && data && Object.keys(data)?.length > 0) {
        form.setFieldsValue(data);
      }
    })();
  }, []);

  return (
    <>
      <Form
        name="transmit-smtp-form"
        labelCol={{ span: 5 }}
        wrapperCol={{ span: 16 }}
        form={form}
        onFinish={handleSubmit}
        style={{ marginTop: 20 }}
      >
        <Col offset={5}>
          <div style={{ fontSize: '20px', paddingBottom: '20px' }}>用户信息</div>
        </Col>
        <Form.Item noStyle name="id"></Form.Item>
        <Form.Item
          label="名称"
          name="mail_username"
          rules={[{ required: true, message: '必须输入名称' }]}
        >
          <Input style={{ width: '100%' }} allowClear placeholder="请输入名称" />
        </Form.Item>
        <Form.Item
          label="邮件地址"
          name="mail_address"
          rules={[{ required: true, message: '必须邮箱地址' }, { validator: validateMail }]}
        >
          <Input style={{ width: '100%' }} allowClear placeholder="请输入邮箱地址" />
        </Form.Item>
        <Col offset={5}>
          <div style={{ fontSize: '20px', paddingBottom: '20px' }}>服务器信息</div>
        </Col>
        <Form.Item
          label="邮件服务器"
          name="smtp_server"
          rules={[{ required: true, message: '必须输入邮件服务器地址' }]}
        >
          <Input style={{ width: '100%' }} allowClear placeholder="请输入邮件服务器" />
        </Form.Item>
        <Form.Item
          label="是否加密"
          name="encrypt"
          rules={[{ required: true, message: '必须选择是否加密' }]}
        >
          <Select style={{ width: '100%' }} placeholder="请选择是否加密">
            <Option key="1" value="1">
              是
            </Option>
            <Option key="0" value="0">
              否
            </Option>
          </Select>
        </Form.Item>
        <Form.Item
          label="服务端口"
          name="server_port"
          rules={[{ required: true, message: '必须输入服务端口' }]}
        >
          <InputNumber min={0} max={65535} style={{ width: '100%' }} placeholder="请输入服务端口" />
        </Form.Item>
        <Col offset={5}>
          <div style={{ fontSize: '20px', paddingBottom: '20px' }}>登录信息</div>
        </Col>
        <Form.Item
          label="登录用户名"
          name="login_user"
          rules={[{ required: true, message: '必须输入登录用户名' }]}
        >
          <Input style={{ width: '100%' }} allowClear placeholder="请输入用户名" />
        </Form.Item>
        <Form.Item
          label="登录密码"
          name="login_password"
          rules={[{ required: true, message: '必须登录密码' }]}
        >
          <Input.Password
            style={{ width: '100%' }}
            visibilityToggle={false}
            allowClear
            placeholder="请输入邮箱密码"
          />
        </Form.Item>
        <Form.Item wrapperCol={{ offset: 5, span: 16 }}>
          <Privacy
            onChange={(flag) => {
              setCheckPrivacy(flag);
            }}
          />
        </Form.Item>
        <Form.Item wrapperCol={{ offset: 5, span: 16 }}>
          <div style={{ display: 'flex', position: 'absolute', left: 0, marginTop: '20px' }}>
            <Button
              disabled={!checkPrivacy}
              type="primary"
              htmlType="submit"
              style={{ marginRight: '10px' }}
            >
              保存
            </Button>
            <Button
              onClick={async () => {
                const params = await form.validateFields();
                const { success, data } = await checkMailByParams(params);
                if (success && data) {
                  message.success('测试成功！');
                } else {
                  message.error('测试失败！');
                }
              }}
            >
              测试
            </Button>
          </div>
        </Form.Item>
      </Form>
    </>
  );
};

export default MaiLConfig;
