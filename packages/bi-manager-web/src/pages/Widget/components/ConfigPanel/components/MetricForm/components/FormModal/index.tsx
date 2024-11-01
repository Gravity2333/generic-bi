import { Button, Checkbox, Divider, Form, Input, Menu, Modal, Select, Tag } from 'antd';
import {
  AXIS_FORMATTER_TYPE_LIST,
  AggregateList,
  AggregateNameDict,
  EFormatterType,
  ESelectType,
  EVisualizationType,
} from '@bi/common';
import { useContext, useImperativeHandle, useMemo, useState } from 'react';
import { ConfigPanelContext } from '../../../..';
import { BookOutlined, EnterOutlined } from '@ant-design/icons';
import TextArea from 'antd/lib/input/TextArea';
import { v4 as uuidv4 } from 'uuid';
import React from 'react';
import { GlobalContext, IGlobalContext } from '@/layouts/GlobalLayout';
import ColumnModeAlert from '../ColumnModeAlert';

const formItemLayout = {
  labelCol: { span: 5 },
  wrapperCol: { span: 16 },
};

function FormModal(
  props: {
    open: boolean;
    setOpen: any;
    label: string;
    onFinish: (values: Record<string, any>) => void;
    onUpdate: (id: string, values: Record<string, any>) => void;
    columnMode?: boolean;
  },
  ref: any,
) {
  const { open, setOpen, label, onFinish, onUpdate, columnMode = false } = props;
  const [modalForm] = Form.useForm();
  const { columns, viz_type, existRollup } = useContext(ConfigPanelContext);
  /** 快速插入字段列 */
  const [insertList, setInsertList] = useState<string[]>([]);
  const { dicts = [] } = useContext<IGlobalContext>(GlobalContext);
  const { dictMappings } = useContext(ConfigPanelContext);

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
      title={`创建${label}`}
      okText="创建"
      cancelText="取消"
      onCancel={() => {
        setOpen(false);
      }}
      onOk={async () => {
        const values = await modalForm.validateFields();
        if (values?.id) {
          onUpdate &&
            onUpdate(values?.id, {
              ...values,
              ...(() => {
                if (columnMode) {
                  return {
                    expression_type: 'sql',
                    columnMode: true,
                  };
                }

                if (!columnMode && values.expression_type === 'sql') {
                  const { type } = columns?.find((c) => c?.name === values.sql_expression) || {};
                  if (type) {
                    return { type };
                  }
                }
                return {};
              })(),
            });
        } else {
          onFinish &&
            onFinish({
              ...values,
              id: uuidv4(),
              ...(() => {
                if (columnMode) {
                  return {
                    expression_type: 'sql',
                    columnMode: true,
                  };
                }
                if (!columnMode && values.expression_type === 'sql') {
                  const { type } = columns?.find((c) => c?.name === values.sql_expression) || {};
                  if (type) {
                    return { type };
                  }
                }
                return {};
              })(),
            });
        }
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
        {columnMode ? (
          <>
            <Form.Item
              required
              name="sql_expression"
              label="字段"
              style={{ marginTop: '20px' }}
              {...formItemLayout}
              rules={[
                {
                  required: true,
                  message: '请选择字段',
                },
              ]}
            >
              <Select
                showSearch
                optionFilterProp="label"
                onChange={(field) => {
                  const { dict_field } =
                    dictMappings.find((mapping) => mapping.table_field === field) || {};
                  const { type, comment } = columns?.find((c) => c?.name === field) || {};
                  modalForm.setFieldsValue({
                    dict_field: dict_field,
                    type,
                    display_name: comment,
                  });
                }}
              >
                {columns?.map((item: any) => {
                  return (
                    <Select.Option
                      key={item.name}
                      value={item.name}
                      label={item.comment || item.name}
                    >
                      {item.comment || item.name}
                      {item.dict_field && (
                        <Tag color={'blue'} style={{ margin: '4px' }} icon={<BookOutlined />}>
                          {dicts.find((dict) => dict.id === item.dict_field)?.name ||
                            item.dict_field}
                        </Tag>
                      )}
                    </Select.Option>
                  );
                })}
              </Select>
            </Form.Item>
          </>
        ) : (
          <>
            <Form.Item
              noStyle
              shouldUpdate={(prevValues, currentValues) =>
                prevValues.expression_type !== currentValues.expression_type
              }
            >
              {({ getFieldValue, setFieldValue }) => {
                const t = getFieldValue('expression_type');
                return (
                  <Form.Item
                    style={{ marginBottom: '0px' }}
                    name="expression_type"
                    initialValue={'simple'}
                  >
                    <Menu
                      mode={'horizontal'}
                      defaultSelectedKeys={t}
                      onSelect={({ key }) => {
                        setFieldValue('expression_type', key);
                      }}
                    >
                      <Menu.Item key="simple">聚合</Menu.Item>
                      <Menu.Item key="sql">自定义</Menu.Item>
                    </Menu>
                  </Form.Item>
                );
              }}
            </Form.Item>
            <Form.Item
              noStyle
              shouldUpdate={(prevValues, currentValues) =>
                prevValues.expression_type !== currentValues.expression_type
              }
            >
              {({ getFieldValue, setFieldValue }) => {
                const t = getFieldValue('expression_type');
                if (t === ESelectType.SIMPLE) {
                  // 复杂度量
                  return (
                    <>
                      <ColumnModeAlert />
                      <Form.Item
                        name="aggregate"
                        label="聚合函数"
                        {...formItemLayout}
                        style={{ marginTop: '10px' }}
                        rules={[
                          {
                            required: true,
                            message: '请选择聚合函数',
                          },
                        ]}
                      >
                        <Select>
                          {AggregateList.map((type) => {
                            return (
                              <Select.Option key={type} value={type}>
                                {AggregateNameDict[type] || type}
                              </Select.Option>
                            );
                          })}
                        </Select>
                      </Form.Item>
                      <Form.Item
                        noStyle
                        shouldUpdate={(prevValues, currentValues) =>
                          prevValues.field !== currentValues.field
                        }
                      >
                        {() => {
                          const f = getFieldValue('field');
                          setFieldValue(
                            'comment',
                            columns?.find((column) => column.name === f)?.comment || '',
                          );
                          return (
                            <Form.Item
                              required
                              name="field"
                              label="字段"
                              {...formItemLayout}
                              rules={[
                                {
                                  required: true,
                                  message: '请选择字段',
                                },
                              ]}
                            >
                              <Select
                                showSearch
                                optionFilterProp="label"
                                onChange={(field) => {
                                  const { dict_field } =
                                    dictMappings.find((mapping) => mapping.table_field === field) ||
                                    {};
                                  const { type, comment } =
                                    columns?.find((c) => c?.name === field) || {};
                                  modalForm.setFieldsValue({
                                    dict_field: dict_field,
                                    type,
                                    display_name: comment,
                                  });
                                }}
                              >
                                {columns?.map((item: any) => {
                                  return (
                                    <Select.Option
                                      key={item.name}
                                      value={item.name}
                                      label={item.comment || item.name}
                                    >
                                      {item.comment || item.name}
                                      {item.dict_field && (
                                        <Tag
                                          color={'blue'}
                                          style={{ margin: '4px' }}
                                          icon={<BookOutlined />}
                                        >
                                          {dicts.find((dict) => dict.id === item.dict_field)
                                            ?.name || item.dict_field}
                                        </Tag>
                                      )}
                                    </Select.Option>
                                  );
                                })}
                              </Select>
                            </Form.Item>
                          );
                        }}
                      </Form.Item>
                      <Form.Item noStyle name="type" />
                      <Form.Item noStyle name="dict_field" />
                      <Form.Item name="comment" noStyle />
                      {viz_type === EVisualizationType.Table ? (
                        <Form.Item
                          name="is_dict_mapping"
                          label="字典匹配"
                          {...formItemLayout}
                          valuePropName="checked"
                          initialValue={false}
                        >
                          <Checkbox />
                        </Form.Item>
                      ) : null}
                    </>
                  );
                } else if (t === ESelectType.SQL) {
                  // 简单度量
                  return (
                    <>
                      <div style={{ width: '100%', marginTop: '10px' }}>
                        <Select
                          showSearch
                          optionFilterProp="label"
                          placeholder="快速插入字段"
                          style={{ width: '75%', marginLeft: '25px' }}
                          mode="multiple"
                          value={insertList}
                          onChange={setInsertList}
                        >
                          {columns?.map((item: any) => {
                            return (
                              <>
                                <Select.Option
                                  key={item.name}
                                  value={item.name}
                                  label={item.comment || item.name}
                                >
                                  {item.comment || item.name}
                                </Select.Option>
                              </>
                            );
                          })}
                        </Select>
                        <Button
                          icon={<EnterOutlined />}
                          disabled={insertList?.length === 0}
                          onClick={() => {
                            const s = getFieldValue('sql_expression') || '';
                            setFieldValue(
                              'sql_expression',
                              s + (insertList?.length > 0 ? insertList?.join(' ') + ' ' : ' '),
                            );
                            setInsertList([]);
                          }}
                        >
                          插入
                        </Button>
                      </div>
                      <Form.Item
                        style={{ margin: '25px' }}
                        {...{
                          wrapperCol: { span: 24 },
                        }}
                        name="sql_expression"
                      >
                        <TextArea rows={4} size="small" placeholder="请输入查询语句"></TextArea>
                      </Form.Item>
                    </>
                  );
                }
                return <></>;
              }}
            </Form.Item>
            <Divider />
          </>
        )}
        {viz_type === EVisualizationType.Table && (
          <>
            <Form.Item
              name="column_format"
              label="列格式化"
              {...formItemLayout}
              initialValue={EFormatterType.Raw}
            >
              <Select>
                {AXIS_FORMATTER_TYPE_LIST.map((type) => (
                  <Select.Option value={type.value} key={type.value}>
                    {type.label}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </>
        )}
        <Form.Item noStyle name="type" />
        <Form.Item noStyle name="dict_field" />
        <Form.Item {...formItemLayout} name="display_name" label="展示名称">
          <Input />
        </Form.Item>
        {existRollup && (
          <Form.Item
            name="isBandwidth"
            valuePropName="checked"
            label="除时间范围"
            {...formItemLayout}
          >
            <Checkbox />
          </Form.Item>
        )}
      </Form>
    </Modal>
  );
}

export default React.forwardRef(FormModal);
