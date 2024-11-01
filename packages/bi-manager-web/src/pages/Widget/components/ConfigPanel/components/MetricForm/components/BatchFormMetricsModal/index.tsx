import { Form, Modal, Select, Tag } from 'antd';
import { useContext, useImperativeHandle, useMemo } from 'react';
import { ConfigPanelContext } from '../../../..';
import { BookOutlined } from '@ant-design/icons';
import { v4 as uuidv4 } from 'uuid';
import React from 'react';
import { GlobalContext, IGlobalContext } from '@/layouts/GlobalLayout';

const formItemLayout = {
  wrapperCol: { span: 24 },
};

function BatchFormMetricsModal(
  props: {
    open: boolean;
    setOpen: any;
    label: string;
    onFinish: (values: any[]) => void;
  },
  ref: any,
) {
  const { open, setOpen, label, onFinish } = props;
  const [modalForm] = Form.useForm();
  const { columns } = useContext(ConfigPanelContext);
  const { dicts = [] } = useContext<IGlobalContext>(GlobalContext);
  const { dictMappings } = useContext(ConfigPanelContext);

  const fieldNameMap = useMemo(() => {
    const map = new Map();
    columns.forEach((column) => {
      map.set(column.name, {
        display_name: column.comment || column.name,
        type: column.type,
      });
    });
    return map;
  }, [columns]);

  const dictMappingMap = useMemo(() => {
    const map = new Map();
    dictMappings.forEach((dictMapping) => {
      map.set(dictMapping.table_field, dictMapping.dict_field);
    });
    return map;
  }, [dictMappings]);

  // 命令式的给`ref.current`赋值个对象
  useImperativeHandle(ref, () => ({
    setInitValues: (values: Record<string, any>) => {
      modalForm.resetFields();
      modalForm.setFieldsValue({
        ...values,
      });
    },
    reset: () => {
      modalForm.resetFields();
    },
  }));

  return (
    <Modal
      open={open}
      title={`批量添加${label}`}
      okText="添加"
      centered
      cancelText="取消"
      onCancel={() => {
        setOpen(false);
      }}
      onOk={async () => {
        const { fields } = await modalForm.validateFields();
        onFinish &&
          onFinish(
            (fields || []).map((field: string) => {
              const { display_name, type } = fieldNameMap.get(field) || {};
              const dict_field = dictMappingMap.get(field);
              return {
                id: uuidv4(),
                expression_type: 'sql',
                columnMode: true,
                sql_expression: field,
                display_name,
                type,
                dict_field,
                is_dict_mapping: dict_field ? true : false,
              };
            }),
          );
        setOpen(false);
      }}
      destroyOnClose
      bodyStyle={{ padding: '0px' }}
    >
      <Form
        form={modalForm}
        initialValues={{
          expression_type: 'simple',
          sql_expression: '',
          display_name: '',
        }}
      >
        <Form.Item name="id" noStyle />
        <Form.Item
          required
          name="fields"
          style={{ margin: '20px' }}
          {...formItemLayout}
          rules={[
            {
              required: true,
              message: '请选择字段',
            },
          ]}
        >
          <Select
            placement="topLeft"
            showSearch
            optionFilterProp="label"
            mode="multiple"
            placeholder="请选择字段"
          >
            {columns?.map((item: any) => {
              return (
                <Select.Option key={item.name} value={item.name} label={item.comment || item.name}>
                  {item.comment || item.name}
                  {item.dict_field && (
                    <Tag
                      color={'blue'}
                      style={{
                        margin: '2px',
                        height: '18px',
                        lineHeight: '18px',
                        fontSize: '11px',
                      }}
                      icon={<BookOutlined />}
                    >
                      {dicts.find((dict) => dict.id === item.dict_field)?.name || item.dict_field}
                    </Tag>
                  )}
                </Select.Option>
              );
            })}
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
}

export default React.forwardRef(BatchFormMetricsModal);
