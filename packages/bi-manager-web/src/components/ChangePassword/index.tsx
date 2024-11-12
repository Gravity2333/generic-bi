import { changePassword } from '@/services/users';
import { backToLogin } from '@/utils';
import { Button, Form, Input, message, Modal } from 'antd';
import FormItem from 'antd/es/form/FormItem';
import { forwardRef, useImperativeHandle, useState } from 'react';
// 表单布局
const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 4 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 17 },
  },
};

export default forwardRef(function ChangePassword({ username }: { username: string }, ref: any) {
  const [visible, setVisible] = useState<boolean>(false);
  const [form] = Form.useForm();
  const handleCancel = () => {
    setVisible(false);
  };

  const handleOk = () => {
    setVisible(false);
  };

  const submit = async () => {
    const res = await form.validateFields();
    const { success } = await changePassword({
      username: username,
      password: res.password,
      oldPassword: res.oldPassword,
    });

    if (success) {
      message.success('密码修改成功！');
      backToLogin();
    }
  };

  const compareToNewPassword = (rule: any, value: string, callback: any) => {
    const newPass = form.getFieldValue('password');
    if (!value && newPass) {
      callback('请再次输入新密码');
    }
    if (value && value !== newPass) {
      callback('两次密码输入不一致');
    } else {
      callback();
    }
  };

  useImperativeHandle(
    ref,
    () => {
      return {
        open: () => {
          setVisible(true);
        },
      };
    },
    [],
  );

  return (
    <Modal
      width={800}
      destroyOnClose
      keyboard={false}
      maskClosable={false}
      title="修改密码"
      visible={visible}
      onOk={handleOk}
      centered
      onCancel={handleCancel}
      closable={false}
      footer={[
        <Button key="back" onClick={handleCancel}>
          取消
        </Button>,
        <Button key="submit" type="primary" onClick={submit}>
          确定
        </Button>,
      ]}
    >
      <Form form={form}>
        <FormItem
          {...formItemLayout}
          label="原始密码"
          name="oldPassword"
          rules={[
            {
              required: true,
              message: '请填写原始密码',
            },
          ]}
        >
          <Input.Password autoComplete="new-password" placeholder="请输入原始密码" />
        </FormItem>
        <FormItem
          name="password"
          {...formItemLayout}
          label="新密码"
          rules={[
            {
              required: true,
              message: '请设置新密码',
            },
          ]}
        >
          <Input.Password autoComplete="new-password" placeholder="请设置新密码" />
        </FormItem>
        <FormItem
          {...formItemLayout}
          label="确认密码"
          name="confirmPassword"
          rules={[
            {
              required: true,
              message: '请再次输入新密码',
            },
            {
              validator: compareToNewPassword,
            },
          ]}
        >
          <Input.Password autoComplete="new-password" placeholder="请再次输入新密码" />
        </FormItem>
      </Form>
    </Modal>
  );
});
