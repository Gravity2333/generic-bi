import { Form, Button, Modal, message, Input } from 'antd';
import { useEffect } from 'react';
import { SettingOutlined } from '@ant-design/icons';
import { getLayoutTitle, setLayoutTitle } from '@/services/layout';
import { dynamicSetHeaderTitle } from '@/utils/layout';

/** SMTP表单参数 */
export interface ILayoutForm {
  title: string;
}

const LayoutConfig = () => {
  const [form] = Form.useForm();

  const handleSubmit = (params: ILayoutForm) => {
    Modal.confirm({
      width: 500,
      title: '确定保存吗?',
      icon: <SettingOutlined />,
      okText: '确定',
      centered: true,
      cancelText: '取消',
      onOk: async () => {
        const { success } = await setLayoutTitle(params['title']);
        if (success) {
          message.success('配置成功！');
          dynamicSetHeaderTitle(params['title'])
        }
      },
    });
  };

  useEffect(() => {
    (async () => {
      const { success, data } = await getLayoutTitle();
      if (success && data && Object.keys(data)?.length > 0) {
        form.setFieldsValue({title: data});
      }
    })();
  }, []);

  return (
    <> 
      <Form
        name="layout-config-form"
        labelCol={{ span: 5 }}
        wrapperCol={{ span: 16 }}
        form={form}
        onFinish={handleSubmit}
        style={{ marginTop: 20 }}
      >
        <Form.Item label="系统标题" name="title" initialValue={'Generic-BI'}>
          <Input style={{ width: '100%' }} placeholder="请填写系统标题" />
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

export default LayoutConfig;
