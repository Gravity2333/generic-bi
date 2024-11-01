import { Checkbox, Col, Form, Input, Modal, Popover, Row, Select, Space, Tag } from 'antd';
import {
  AXIS_FORMATTER_TYPE_LIST,
  EVisualizationType,
  IClickhouseColumn,
  IDictMapping,
  IGroupBy,
} from '@bi/common';
import { useContext, useImperativeHandle, useState } from 'react';
import { BookOutlined, QuestionCircleOutlined, QuestionOutlined } from '@ant-design/icons';
import React from 'react';
import { GlobalContext, IGlobalContext } from '@/layouts/GlobalLayout';
import { SimpleCustomTypeSwitch } from '@/components/SimpleCustomTypeSwitch';
import ColumnModeAlert from '../../../MetricForm/components/ColumnModeAlert';

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
    columns: IClickhouseColumn[];
    groups: IGroupBy[];
    viz_type: EVisualizationType;
    dictMappings: IDictMapping[];
    onUpdate: (field: string, values: Record<string, any>) => void;
  },
  ref: any,
) {
  const { open, setOpen, label, onFinish, onUpdate, columns, groups, viz_type, dictMappings } =
    props;
  const [modalForm] = Form.useForm();
  const [oldField, setOldField] = useState<string>('');
  const { dicts = [] } = useContext<IGlobalContext>(GlobalContext);
  // 命令式的给`ref.current`赋值个对象
  useImperativeHandle(ref, () => ({
    setInitValues: (values: Record<string, any>) => {
      modalForm.resetFields();
      modalForm.setFieldsValue({
        ...values,
      });
      setOldField(values?.field);
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
        setOldField('');
        setOpen(false);
      }}
      onOk={async () => {
        const values = await modalForm.validateFields();
        if (oldField) {
          onUpdate(oldField, values);
        } else {
          onFinish &&
            onFinish({
              ...values,
            });
        }
        setOldField('');
      }}
      destroyOnClose={true}
      bodyStyle={{ padding: '0px' }}
    >
      <Form form={modalForm}>
        <Form.Item style={{ margin: '10px 0px', padding: '0px' }}>
          <ColumnModeAlert title="新增分组会清空当前表格展示列配置！" />
          <Form.Item
            style={{ marginBottom: '10px', height: '35px' }}
            wrapperCol={{ span: 16 }}
            labelCol={{ span: 2, offset: 3 }}
            label="字段"
          >
            <Row>
              <Col span={18}>
                <Form.Item
                  style={{ marginBottom: '10px', flexBasis: '400px' }}
                  shouldUpdate={(prev, curr) => prev.fieldType !== curr.fieldType}
                >
                  {({ getFieldValue }) => {
                    const fieldType = getFieldValue('fieldType');
                    if (fieldType === 'custom') {
                      return (
                        <Form.Item
                          name="field"
                          style={{ width: '100%' }}
                          required={true}
                          rules={[
                            {
                              required: true,
                              message: '必须输入分组字段！',
                            },
                          ]}
                        >
                          <Input placeholder="请输入分组字段" style={{ width: '100%' }} />
                        </Form.Item>
                      );
                    } else {
                      return (
                        <>
                          <Form.Item
                            name="field"
                            style={{ width: '100%' }}
                            required={true}
                            rules={[
                              {
                                required: true,
                                message: '必须选择分组字段！',
                              },
                            ]}
                          >
                            <Select
                              showSearch
                              optionFilterProp="label"
                              placeholder="请选择分组字段"
                              style={{ width: '100%' }}
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
                                    disabled={(() => {
                                      if (item.name === oldField) return false;
                                      return !!groups?.find((group) => group.field === item.name);
                                    })()}
                                    key={item.name}
                                    value={item.name}
                                    label={item.comment || item.name}
                                  >
                                    <div
                                      style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        width: '100%',
                                      }}
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
                                    </div>
                                  </Select.Option>
                                );
                              })}
                            </Select>
                          </Form.Item>
                        </>
                      );
                    }
                  }}
                </Form.Item>
              </Col>
              <Col>
                <div
                  style={{
                    lineHeight: '30px',
                    fontSize: '10px',
                    top: '45px',
                    right: '60px',
                    textAlign: 'center',
                    marginLeft: '10px',
                  }}
                >
                  <Form.Item noStyle shouldUpdate>
                    {({ setFieldValue }) => {
                      return (
                        <Form.Item noStyle name="fieldType" initialValue={'simple'}>
                          <SimpleCustomTypeSwitch
                            onSwitch={() => {
                              setFieldValue('field', undefined);
                            }}
                            size="default"
                          />
                        </Form.Item>
                      );
                    }}
                  </Form.Item>
                </div>
              </Col>
            </Row>
          </Form.Item>
        </Form.Item>
        <Form.Item
          noStyle
          shouldUpdate={(prev, curr) =>
            prev.type !== curr.type || prev.fieldType !== curr.fieldType
          }
        >
          {({ getFieldValue }) => {
            const type = getFieldValue('type') || '';
            const fieldType = getFieldValue('fieldType') || '';
            if (fieldType === 'simple' && /^Array((.*))$/.test(type || '')) {
              return (
                <Form.Item
                  {...formItemLayout}
                  name="arrayJoin"
                  label={
                    <>
                      <span>展开数组</span>
                      <Popover
                        style={{ padding: '5px' }}
                        placement="right"
                        content={
                          <div style={{ fontSize: '12px' }}>
                            <ul style={{ margin: '0px', paddingLeft: '10px' }}>
                              <li>当前所选字段为数组类型。勾选后，会展开数组内容后进行分组。</li>
                              <li>⚠️ 若数组内容为空，可能导致查询出空结果！</li>
                            </ul>
                          </div>
                        }
                        trigger="hover"
                      >
                        <QuestionCircleOutlined
                          style={{
                            cursor: 'help',
                            fontSize: '12px',
                            verticalAlign: '-2px',
                            marginLeft: '3px',
                          }}
                        />
                      </Popover>
                    </>
                  }
                  valuePropName="checked"
                  initialValue={true}
                >
                  <Checkbox />
                </Form.Item>
              );
            }
          }}
        </Form.Item>
        <Form.Item noStyle name="type" />
        <Form.Item noStyle name="dict_field" />
        {viz_type === EVisualizationType.Table ? (
          <>
            <Form.Item name="display_name" label="展示名称" {...formItemLayout}>
              <Input />
            </Form.Item>
            <Form.Item name="column_format" label="列格式化" {...formItemLayout}>
              <Select>
                {AXIS_FORMATTER_TYPE_LIST.map((type) => (
                  <Select.Option value={type.value} key={type.value}>
                    {type.label}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </>
        ) : null}
        {viz_type === EVisualizationType.Bar || viz_type === EVisualizationType.Column ? (
          <Form.Item name="connect_symbol" label="连接符号" {...formItemLayout}>
            <Input placeholder='默认连接符为 " "' />
          </Form.Item>
        ) : null}
      </Form>
    </Modal>
  );
}

export default React.forwardRef(FormModal);
