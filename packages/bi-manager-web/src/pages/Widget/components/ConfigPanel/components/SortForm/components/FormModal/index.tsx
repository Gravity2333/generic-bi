import { Button, Form, Menu, Modal, Select, Switch } from 'antd';
import { AggregateList, AggregateNameDict, ESelectType, ESortDirection } from '@bi/common';
import { useContext, useImperativeHandle, useState } from 'react';
import { ConfigPanelContext } from '../../../..';
import { EnterOutlined } from '@ant-design/icons';
import TextArea from 'antd/lib/input/TextArea';
import { v4 as uuidv4 } from 'uuid';
import React from 'react';
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
    onUpdate: (id: string, values: Record<string, any>) => void;
  },
  ref: any,
) {
  const { open, setOpen, label, onFinish, onUpdate } = props;
  const [modalForm] = Form.useForm();
  const { columns } = useContext(ConfigPanelContext);
  /** 快速插入字段列 */
  const [insertList, setInsertList] = useState<string[]>([]);

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
            });
        } else {
          onFinish &&
            onFinish({
              ...values,
              id: uuidv4(),
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
          direction: ESortDirection.Asc,
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
              <Form.Item
                style={{ marginBottom: '10px',  }}
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
                  {/* <Menu.Item key="percentage">百分比</Menu.Item> */}
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
                        'type',
                        columns?.find((column) => column.name === f)?.type || '',
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
        <Form.Item
          noStyle
          shouldUpdate={(prevValues, currentValues) =>
            prevValues.direction !== currentValues.direction
          }
        >
          {({ getFieldValue, setFieldValue }) => {
            return (
              <Form.Item
                {...formItemLayout}
                name="direction"
                label="排序方向"
                style={{ marginTop: '10px' }}
                initialValue={ESortDirection.Asc}
              >
                <Switch
                  checkedChildren="升序"
                  unCheckedChildren="降序"
                  checked={getFieldValue('direction') === ESortDirection.Asc}
                  onChange={(e: any) => {
                    setFieldValue('direction', e ? ESortDirection.Asc : ESortDirection.Desc);
                  }}
                />
              </Form.Item>
            );
          }}
        </Form.Item>
      </Form>
    </Modal>
  );
}

export default React.forwardRef(FormModal);
