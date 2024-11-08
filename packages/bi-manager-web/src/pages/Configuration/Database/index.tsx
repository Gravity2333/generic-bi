import { EDatabaseType } from '@bi/common';
import { Button, Card, Form, Input, InputNumber, List, message } from 'antd';
import CLICKHOUSE_SVG from './assets/clickhouse.svg';
import POSTGRE_SVG from './assets/PostgreSQL.svg';
import MYSQL_SVG from './assets/Mysql.svg';
import styles from './index.less';
import useDaynamicTheme from '@/hooks/useDynamicTheme';
import TextArea from 'antd/lib/input/TextArea';
import { configDatabase, queryDabaseConfig } from '@/services/database';
import { useEffect } from 'react';

const validatePort = (rule: any, value: number, callback: (msg?: string) => void) => {
  if (value) {
    if (isNaN(value)) {
      callback('请输入正确的端口值');
    }
    if (value < 0 || value > 65535) {
      callback('请输入正确的范围内的端口值!');
    }
  }
  callback();
};

const FORM_COL = {
  labelCol: { span: 4 },
  wrapperCol: { span: 16 },
};

export default function DatabaseConfig() {
  const [modalForm] = Form.useForm();
  const datasourceType = Form.useWatch('datasource_type', modalForm);
  const [, isDark] = useDaynamicTheme();
  
  const handleSubmit = async (vals: any) => {
    const params = {
      id: vals.id,
      type: vals['datasource_type'],
      option: vals.option,
    };
    const { success } = await configDatabase(params);
    if (success) {
      message.success('数据库配置成功！');
    }
  };

  useEffect(() => {
    (async () => {
      const initialValues = await queryDabaseConfig();
      if (Object.keys(initialValues)?.length > 0) {
        modalForm.setFieldsValue(initialValues);
      }
    })();
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <Form form={modalForm} onFinish={handleSubmit}>
        <Form.Item noStyle name="id"></Form.Item>
        <Form.Item wrapperCol={{ offset: 4, span: 16 }}>
          <Form.Item name="datasource_type" initialValue={EDatabaseType.CLICKHOUSE} noStyle>
            <List
              grid={{ gutter: 10, column: 5 }}
              dataSource={[
                {
                  title: 'CLICKHOUSE',
                  value: EDatabaseType.CLICKHOUSE,
                  svg: (
                    <img
                      draggable={false}
                      src={CLICKHOUSE_SVG}
                      alt=""
                      style={{ fontSize: '100px' }}
                    />
                  ),
                },
                {
                  title: 'POSTGRE',
                  value: EDatabaseType.POSTGRE,
                  svg: (
                    <img draggable={false} src={POSTGRE_SVG} alt="" style={{ fontSize: '100px' }} />
                  ),
                },
                {
                  title: 'MYSQL',
                  value: EDatabaseType.MYSQL,
                  svg: (
                    <img draggable={false} src={MYSQL_SVG} alt="" style={{ fontSize: '100px' }} />
                  ),
                },
              ]}
              renderItem={(item: any) => (
                <List.Item>
                  <Card
                    title={undefined}
                    size="small"
                    className={styles.card}
                    style={{
                      background: datasourceType === item.value && isDark ? '#1890ff' : 'white',
                      boxShadow: datasourceType === item.value ? '0 0 20px rgba(0,0,0,0.8)' : '',
                      borderRadius: datasourceType === item.value ? '10px' : '',
                    }}
                    bodyStyle={{
                      padding: '0px',
                      height: '100%',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      position: 'relative',
                      caretColor: 'transparent',
                    }}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      modalForm.setFieldValue('datasource_type', item.value);
                    }}
                  >
                    {item.svg}
                    <div
                      style={{
                        position: 'absolute',
                        left: '0px',
                        bottom: '0px',
                        height: '30px',
                        lineHeight: '30px',
                        width: '100%',
                        textAlign: 'center',
                      }}
                    >
                      {item.title}
                    </div>
                  </Card>
                </List.Item>
              )}
            />
          </Form.Item>
        </Form.Item>
        <Form.Item name="option" noStyle>
          {(() => {
            switch (datasourceType) {
              case EDatabaseType.CLICKHOUSE:
                return (
                  <>
                    <Form.Item
                      label="协议"
                      name={['option', 'protocol']}
                      {...FORM_COL}
                      rules={[
                        {
                          required: true,
                          message: '请填写协议',
                        },
                      ]}
                      initialValue={'https:'}
                    >
                      <Input placeholder="请填写数协议,格式如 https:" />
                    </Form.Item>
                    <Form.Item
                      label="host地址"
                      name={['option', 'host']}
                      {...FORM_COL}
                      rules={[
                        {
                          required: true,
                          message: '请填写数据库host地址!',
                        },
                      ]}
                    >
                      <Input placeholder="请填写数据库host地址" />
                    </Form.Item>
                    <Form.Item
                      label="端口"
                      name={['option', 'port']}
                      {...FORM_COL}
                      rules={[
                        {
                          required: true,
                          message: '请填写数据库端口!',
                        },
                        {
                          validator: validatePort,
                        },
                      ]}
                    >
                      <InputNumber
                        style={{ width: '300px' }}
                        min={0}
                        max={65535}
                        placeholder="请填写数据库端口"
                      />
                    </Form.Item>
                    <Form.Item label="路径" name={['option', 'path']} {...FORM_COL}>
                      <Input placeholder="请填写路径" />
                    </Form.Item>
                    <Form.Item
                      label="用户名"
                      name={['option', 'user']}
                      {...FORM_COL}
                      rules={[
                        {
                          required: true,
                          message: '请填写数据库用户名称!',
                        },
                      ]}
                    >
                      <Input placeholder="请填写数据库用户名称" />
                    </Form.Item>
                    <Form.Item label="密码" name={['option', 'password']} {...FORM_COL}>
                      <Input type="password" placeholder="请填写数据库密码" />
                    </Form.Item>
                    <Form.Item
                      label="数据库名称"
                      name={['option', 'database']}
                      {...FORM_COL}
                      rules={[
                        {
                          required: true,
                          message: '请填写数据库名称!',
                        },
                      ]}
                    >
                      <Input type="password" placeholder="请填写数据库名称" />
                    </Form.Item>
                    <Form.Item label="ca" name={['option', 'ca']} {...FORM_COL}>
                      <TextArea placeholder="请填写ca" rows={4} />
                    </Form.Item>
                  </>
                );
              case EDatabaseType.POSTGRE:
                return (
                  <>
                    <Form.Item
                      label="host地址"
                      name={['option', 'host']}
                      {...FORM_COL}
                      rules={[
                        {
                          required: true,
                          message: '请填写数据库host地址!',
                        },
                      ]}
                    >
                      <Input placeholder="请填写数据库host地址" />
                    </Form.Item>
                    <Form.Item
                      label="端口"
                      name={['option', 'port']}
                      {...FORM_COL}
                      rules={[
                        {
                          required: true,
                          message: '请填写数据库端口!',
                        },
                        {
                          validator: validatePort,
                        },
                      ]}
                    >
                      <InputNumber
                        style={{ width: '300px' }}
                        min={0}
                        max={65535}
                        placeholder="请填写数据库端口"
                      />
                    </Form.Item>
                    <Form.Item
                      label="用户名"
                      name={['option', 'user']}
                      {...FORM_COL}
                      rules={[
                        {
                          required: true,
                          message: '请填写数据库用户名称!',
                        },
                      ]}
                    >
                      <Input placeholder="请填写数据库用户名称" />
                    </Form.Item>
                    <Form.Item label="密码" name={['option', 'password']} {...FORM_COL}>
                      <Input type="password" placeholder="请填写数据库密码" />
                    </Form.Item>
                    <Form.Item
                      label="数据库名称"
                      name={['option', 'database']}
                      {...FORM_COL}
                      rules={[
                        {
                          required: true,
                          message: '请填写数据库名称!',
                        },
                      ]}
                    >
                      <Input type="password" placeholder="请填写数据库名称" />
                    </Form.Item>
                  </>
                );
              case EDatabaseType.MYSQL:
                return <>敬请期待!</>;
            }
          })()}
        </Form.Item>
        <Form.Item wrapperCol={{ offset: 4 }}>
          <Button
            type="primary"
            htmlType="submit"
            disabled={datasourceType === EDatabaseType.MYSQL}
          >
            保存
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}
