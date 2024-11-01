import { Button, Checkbox, Form, Input, InputNumber, Menu, Modal, Popover, Select } from 'antd';
import { AggregateList, AggregateNameDict, ESelectType, formatMetric } from '@bi/common';
import { useContext, useImperativeHandle, useState } from 'react';
import { ConfigPanelContext } from '../../../..';
import { EnterOutlined } from '@ant-design/icons';
import TextArea from 'antd/lib/input/TextArea';
import { v4 as uuidv4 } from 'uuid';
import React from 'react';
import { HexColorPicker } from 'react-colorful';
import { useWatch } from 'antd/lib/form/Form';

const DEFAULT_REFERENCE_COLOR = '#ff0505';

const formItemLayout = {
  labelCol: { span: 5 },
  wrapperCol: { span: 16 },
};

function convertToRGA(color: string) {
  var r = parseInt(color.substring(1,3), 16); // 提取红色值并转换为十进制
  var g = parseInt(color.substring(3,5), 16); // 提取绿色值并转换为十进制
  var b = parseInt(color.substring(5,7), 16); // 提取蓝色值并转换为十进制
  
  return "rgba(" + r + ", " + g + ", " + b + ",.4)"; // 返回RGBA格式字符串
}

function FormModal(
  props: {
    open: boolean;
    setOpen: any;
    label: string;
    onFinish: (values: Record<string, any>) => void;
    onUpdate: (id: string, values: Record<string, any>) => void;
  },
  ref: any,
) {
  const { open, setOpen, label, onFinish, onUpdate } = props;
  const [modalForm] = Form.useForm();
  const { columns, dictMappings, metrics } = useContext(ConfigPanelContext);
  /** 快速插入字段列 */
  const [insertList, setInsertList] = useState<string[]>([]);
  const expression_type = useWatch('expression_type', modalForm);
  // 命令式的给`ref.current`赋值个对象
  useImperativeHandle(ref, () => ({
    setInitValues: (values: Record<string, any>) => {
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
        if (expression_type === ESelectType.PERCENTAGE) {
          if (!values.display_name) {
            const m = metrics.find((m) => m.id === values.metricId);
            values.display_name = `参考${m ? formatMetric(m) : values.id} ${values.percentage}%`;
          }
          if (values?.id) {
            onUpdate &&
              onUpdate(values?.id, {
                ...values,
              });
          } else {
            onFinish &&
              onFinish({
                ...values,
                id: uuidv4(),
              });
          }
          modalForm.resetFields();
        } else {
          let field = values.expression_type === 'simple' ? values?.field : values?.sql_expression;
          const { dict_field } =
            dictMappings.find((mapping) => mapping.table_field === field) || {};
          if (values?.id) {
            onUpdate &&
              onUpdate(values?.id, {
                ...values,
                dict_field,
              });
          } else {
            onFinish &&
              onFinish({
                ...values,
                id: uuidv4(),
                dict_field,
              });
          }
          modalForm.resetFields();
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
          color: DEFAULT_REFERENCE_COLOR,
        }}
      >
        <Form.Item name="id" noStyle />
        <Form.Item
          noStyle
          shouldUpdate={(prevValues, currentValues) =>
            prevValues.expression_type !== currentValues.expression_type
          }
        >
          {({ getFieldValue, setFieldValue }) => {
            const t = getFieldValue('expression_type');
            return (
              <Form.Item name="expression_type" initialValue={'simple'}>
                <Menu
                  mode={'horizontal'}
                  defaultSelectedKeys={t}
                  onSelect={({ key }) => {
                    setFieldValue('expression_type', key);
                  }}
                >
                  <Menu.Item key="simple">简单</Menu.Item>
                  <Menu.Item key="sql">自定义</Menu.Item>
                  <Menu.Item key="percentage">百分比</Menu.Item>
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
            if (expression_type === ESelectType.SIMPLE) {
              // 复杂度量
              return (
                <>
                  <Form.Item
                    name="aggregate"
                    label="聚合函数"
                    {...formItemLayout}
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
                          <Select showSearch optionFilterProp="label">
                            {columns?.map((item: any) => {
                              return (
                                <Select.Option
                                  key={item.name}
                                  value={item.name}
                                  label={item.comment || item.name}
                                >
                                  {item.comment || item.name}
                                </Select.Option>
                              );
                            })}
                          </Select>
                        </Form.Item>
                      );
                    }}
                  </Form.Item>
                  <Form.Item name="comment" noStyle />
                </>
              );
            } else if (expression_type === ESelectType.SQL) {
              // 简单度量
              return (
                <>
                  <div style={{ width: '100%' }}>
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
            } else if (expression_type === ESelectType.PERCENTAGE) {
              // 简单度量
              return (
                <>
                  <Form.Item
                    name="metricId"
                    label="度量"
                    {...formItemLayout}
                    rules={[
                      {
                        required: true,
                        message: '请选择度量',
                      },
                    ]}
                  >
                    <Select
                      showSearch
                      optionFilterProp="label"
                      placeholder="请选择度量"
                      value={insertList}
                      onChange={setInsertList}
                    >
                      {metrics?.map((m) => {
                        const label = m.display_name || formatMetric(m);
                        return (
                          <>
                            <Select.Option value={m.id} label={label}>
                              {label}
                            </Select.Option>
                          </>
                        );
                      })}
                    </Select>
                  </Form.Item>
                  <Form.Item
                    name="percentage"
                    label="百分比"
                    {...formItemLayout}
                    initialValue={100}
                    rules={[]}
                    extra="参考度量最大值百分比绘制参考线，范围(0%-100%)"
                  >
                    <InputNumber min={0} max={100} />
                  </Form.Item>
                </>
              );
            }
            return <></>;
          }}
        </Form.Item>
        <Form.Item {...formItemLayout} name="display_name" label="展示名称">
          <Input />
        </Form.Item>
        {expression_type !== ESelectType.PERCENTAGE ? (
          <Form.Item
            name="denominator"
            valuePropName="checked"
            label="除时间范围"
            {...formItemLayout}
          >
            <Checkbox />
          </Form.Item>
        ) : null}

        <Form.Item
          noStyle
          shouldUpdate={(prevValues, currentValues) =>
            prevValues.expression_type !== currentValues.expression_type
          }
        >
          {({ getFieldValue, setFieldValue }) => {
            const color = getFieldValue('color');
            return (
              <Form.Item name="color" label="颜色" {...formItemLayout}>
                <div style={{ display: 'flex', height: '25px' }}>
                  <Popover
                    content={
                      <HexColorPicker
                        color={color}
                        onChange={(c) => {
                          setFieldValue('color', convertToRGA(c));
                        }}
                      />
                    }
                    placement="bottom"
                  >
                    {
                      <div
                        style={{
                          display: 'inline-block',
                          width: '25px',
                          height: '25px',
                          border: '1px solid black',
                          borderRadius: '50%',
                          cursor: 'pointer',
                          backgroundColor: color,
                        }}
                      />
                    }
                  </Popover>
                  <div style={{ marginLeft: '10px', lineHeight: '25px', display: 'inline-block' }}>
                    标志线颜色
                  </div>
                </div>
              </Form.Item>
            );
          }}
        </Form.Item>
      </Form>
    </Modal>
  );
}

export default React.forwardRef(FormModal);
