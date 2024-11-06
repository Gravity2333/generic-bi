import { Button, Card, Form, Input, Menu, Modal, Select, Tag } from 'antd';
import { EFilterType} from '../../../../typings';
import {
  ESelectType,
  IClickhouseColumn,
  INpmdDict,
  OPERATOR_LIST,
  TFieldOperator,
  getOperatorByFieldType,
} from '@bi/common';
import { useEffect, useImperativeHandle, useMemo, useState } from 'react';
import { BookOutlined, CloseSquareOutlined, EnterOutlined, PlusOutlined } from '@ant-design/icons';
import TextArea from 'antd/lib/input/TextArea';
import { v4 as uuidv4 } from 'uuid';
import React from 'react';

const generateEmptySimpleFilter = () => {
  return {
    expression_type: 'simple',
    field: '',
    field_type: '',
    operator: '',
    value: undefined,
    sql_expression: null,
    id: uuidv4(),
  };
};

function FormModal(
  props: {
    open: boolean;
    setOpen: any;
    label: string;
    dicts: INpmdDict[];
    columns: IClickhouseColumn[];
    onFinish: (values: Record<string, any>) => void;
    onUpdate: (id: string, values: Record<string, any>) => void;
  },
  ref: any,
) {
  const { open, setOpen, label, onFinish, columns, dicts, onUpdate } = props;
  const [modalForm] = Form.useForm();
  /** 快速插入字段列 */
  const [insertList, setInsertList] = useState<string[]>([]);
  const filters = Form.useWatch('filters', modalForm);
  const expressionType = Form.useWatch('expression_type', modalForm);
  const sqlExpression = Form.useWatch('sql_expression', modalForm);

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

  /** 更新过滤条件 */
  const updateFilter = (id: string, filter: Record<string, string>) => {
    const newList = [...filters];
    for (let i = 0; i < newList.length; i++) {
      if (id === newList[i].id) {
        newList[i] = { ...newList[i], ...filter };
        break;
      }
    }
    modalForm.setFieldValue('filters', newList);
  };

  /** 删除过滤条件 */
  const deleteFilter = (id: string) => {
    const newList = [...filters];
    modalForm.setFieldValue(
      'filters',
      newList.filter((i) => i.id !== id),
    );
  };

  /** 检查过滤条件 */
  const checkedFilter = useMemo(() => {
    if (expressionType === 'sql') {
      if (sqlExpression !== '') {
        return false;
      }
      return true;
    }
    const filterList = filters || [];
    if (filterList.length === 0) {
      return true;
    }
    const checkedNum = filterList.reduce((pre: any, filter: any) => {
      if (filter.field && filter.operator) {
        if (filter.operator === 'NOT_EXISTS' || filter.operator === 'EXISTS') {
          return filter.value ? pre : pre + 1;
        }
        return filter.value ? pre + 1 : pre;
      }
      return pre;
    }, 0);
    if (checkedNum !== filterList.length) {
      return true;
    }
    return false;
  }, [filters, expressionType, sqlExpression]);

  return (
    <Modal
      open={open}
      title={`创建${label}`}
      onCancel={() => {
        setOpen(false);
      }}
      footer={
        <>
          <Button
            onClick={() => {
              setOpen(false);
            }}
          >
            取消
          </Button>
          <Button
            disabled={checkedFilter}
            onClick={async () => {
              const values = await modalForm.validateFields();
              if (values?.id) {
                if (values?.expression_type === 'simple') {
                  onUpdate(values?.id, {
                    expression_type: 'simple',
                    operator: values?.group_operation,
                    group: values?.filters?.map((f: any) => ({
                      ...f,
                      expression_type: 'simple',
                    })),
                    id: values?.id,
                  });
                } else if (values?.expression_type === 'sql') {
                  onUpdate(values?.id, {
                    expression_type: 'sql',
                    sql_expression: values?.sql_expression,
                    filter_type: values?.filter_type,
                    id: values?.id,
                  });
                }
              } else {
                const id = uuidv4();
                if (values?.expression_type === 'simple') {
                  onFinish({
                    expression_type: 'simple',
                    operator: values?.group_operation,
                    group: values?.filters?.map((f: any) => ({
                      ...f,
                      expression_type: 'simple',
                    })),
                    id,
                  });
                } else if (values?.expression_type === 'sql') {
                  onFinish({
                    expression_type: 'sql',
                    sql_expression: values?.sql_expression,
                    filter_type: values?.filter_type,
                    id,
                  });
                }
              }
              modalForm.resetFields();
              setOpen(false);
            }}
            type="primary"
          >
            创建
          </Button>
        </>
      }
      width={800}
      destroyOnClose
      bodyStyle={{ padding: '0px' }}
    >
      <Form
        form={modalForm}
        initialValues={{
          expression_type: 'simple',
          sql_expression: '',
          filters: [],
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
                </Menu>
              </Form.Item>
            );
          }}
        </Form.Item>
        <Card
          size="small"
          style={{ background: '#f0f0f0', margin: '20px' }}
          title={
            expressionType === 'simple' ? (
              <Form.Item initialValue={'AND'} noStyle name="group_operation">
                <Select bordered={false} style={{ width: '150px' }}>
                  <Select.Option value={'AND'}>全部匹配 (AND)</Select.Option>
                  <Select.Option value={'OR'}>任意匹配 (OR)</Select.Option>
                </Select>
              </Form.Item>
            ) : null
          }
          bodyStyle={{ backgroundColor: 'white' }}
        >
          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) =>
              prevValues.expression_type !== currentValues.expression_type
            }
          >
            {({ getFieldValue, setFieldValue }) => {
              const t = getFieldValue('expression_type');
              if (t === ESelectType.SIMPLE) {
                return (
                  <>
                    <Form.Item
                      noStyle
                      shouldUpdate={(prevValues, curValues) =>
                        prevValues.filters !== curValues.filters
                      }
                    >
                      {({ getFieldValue }) => {
                        const filters = getFieldValue('filters') || [];
                        return (
                          <Form.Item name="filters" noStyle initialValue={[]}>
                            {filters.map((filter: any) => {
                              const { id } = filter;
                              return (
                                <div style={{ margin: '5px 0px' }}>
                                  <Select
                                    placeholder="过滤字段"
                                    showSearch
                                    optionFilterProp="label"
                                    value={filter.field}
                                    style={{ width: '40%' }}
                                    onChange={(e) => {
                                      const column: any =
                                        columns?.find((item) => item.name === e) || {};
                                      updateFilter(id, {
                                        field: e,
                                        field_type: column?.type || '',
                                        dict_field: column?.dict_field,
                                      });
                                    }}
                                  >
                                    {columns.map((item: any) => {
                                      return (
                                        <Select.Option
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
                                  <Select
                                    placeholder="操作符"
                                    style={{ width: '15%' }}
                                    value={filter.operator}
                                    onChange={(e: TFieldOperator) => {
                                      updateFilter(id, {
                                        operator: e,
                                        value: '',
                                      });
                                    }}
                                  >
                                    {filter.field === 'network_id' ? (
                                      <>
                                        <Select.Option key={'EQUALS'} value={'EQUALS'}>
                                          =
                                        </Select.Option>
                                        <Select.Option key={'NOT_EQUALS'} value={'NOT_EQUALS'}>
                                          !=
                                        </Select.Option>
                                      </>
                                    ) : (
                                      getOperatorByFieldType(filter.field_type).map(
                                        (operator: any) => {
                                          const { label } =
                                            (OPERATOR_LIST.find(
                                              (item) => item.value === operator,
                                            ) as any) || {};
                                          return (
                                            <Select.Option key={operator} value={operator}>
                                              {label || operator}
                                            </Select.Option>
                                          );
                                        },
                                      )
                                    )}
                                  </Select>
                                  {filter.dict_field && filter.field === 'network_id' ? (
                                    <Select
                                      showSearch
                                      optionFilterProp="label"
                                      mode="multiple"
                                      disabled={
                                        filter.operator === 'EXISTS' ||
                                        filter.operator === 'NOT_EXISTS'
                                      }
                                      style={{
                                        width: '40%',
                                        whiteSpace: 'nowrap',
                                      }}
                                      onChange={(e) => {
                                        updateFilter(id, {
                                          value: e ? `${e}` : '',
                                        });
                                      }}
                                      value={filter.value ? filter.value.split(',') : []}
                                    >
                                      <Select.Option key={'ALL'} value={'ALL'} label={'所有主网络'}>
                                        所有主网络
                                      </Select.Option>
                                      {(() => {
                                        const dict = dicts.find(
                                          (dict) => dict.id === filter.dict_field,
                                        )?.dict;
                                        if (dict) {
                                          return Object.keys(dict).map((key) => {
                                            return (
                                              <Select.Option
                                                key={key}
                                                value={key}
                                                label={dict[key]}
                                              >
                                                {dict[key]}
                                              </Select.Option>
                                            );
                                          });
                                        }
                                      })()}
                                    </Select>
                                  ) : filter.dict_field ? (
                                    <Select
                                      showSearch
                                      optionFilterProp="label"
                                      disabled={
                                        filter.operator === 'EXISTS' ||
                                        filter.operator === 'NOT_EXISTS'
                                      }
                                      style={{
                                        width: '40%',
                                        whiteSpace: 'nowrap',
                                      }}
                                      onChange={(e) => {
                                        updateFilter(id, {
                                          value: e ? `${e}` : '',
                                        });
                                      }}
                                      value={filter.value}
                                    >
                                      {(() => {
                                        const dict = dicts.find(
                                          (dict) => dict.id === filter.dict_field,
                                        )?.dict;
                                        if (dict) {
                                          return Object.keys(dict).map((key) => {
                                            return (
                                              <Select.Option
                                                key={key}
                                                value={key}
                                                label={dict[key]}
                                              >
                                                {dict[key]}
                                              </Select.Option>
                                            );
                                          });
                                        }
                                      })()}
                                    </Select>
                                  ) : (
                                    <Input
                                      disabled={
                                        filter.operator === 'EXISTS' ||
                                        filter.operator === 'NOT_EXISTS'
                                      }
                                      style={{ width: '40%' }}
                                      value={filter.value}
                                      onChange={(e) => {
                                        updateFilter(id, {
                                          value: e.target.value,
                                        });
                                      }}
                                    />
                                  )}
                                  <Button
                                    danger
                                    type="link"
                                    icon={<CloseSquareOutlined />}
                                    onClick={() => {
                                      deleteFilter(id);
                                    }}
                                  />
                                </div>
                              );
                            })}
                          </Form.Item>
                        );
                      }}
                    </Form.Item>
                    <Form.Item style={{ margin: '0px' }}>
                      <Button
                        type="dashed"
                        onClick={() => {
                          setFieldValue('filters', [
                            ...getFieldValue('filters'),
                            generateEmptySimpleFilter(),
                          ]);
                        }}
                        style={{ width: '100%', backgroundColor: 'rgba(0,0,0,0)' }}
                        icon={<PlusOutlined />}
                      >
                        新增过滤条件
                      </Button>
                    </Form.Item>
                  </>
                );
              } else if (t === ESelectType.SQL) {
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
                          const newSqlExp =
                            s + (insertList?.length > 0 ? insertList?.join(' ') + ' ' : ' ');
                          setFieldValue('sql_expression', newSqlExp);
                          setInsertList([]);
                        }}
                      >
                        插入
                      </Button>
                    </div>
                    <Form.Item
                      style={{ marginLeft: '25px', marginTop: '25px' }}
                      {...{
                        wrapperCol: { span: 24 },
                      }}
                      name="sql_expression"
                    >
                      <TextArea rows={4} size="small" placeholder="请输入查询语句" />
                    </Form.Item>
                    <Form.Item
                      name="filter_type"
                      initialValue={EFilterType.WHERE}
                      {...{
                        wrapperCol: { span: 24 },
                      }}
                      style={{ marginLeft: '25px' }}
                      extra={`WHERE:过滤字段,HAVING:过滤度量`}
                    >
                      <Select style={{ width: '100%' }}>
                        <Select.Option value={EFilterType.WHERE}>WHERE</Select.Option>
                        <Select.Option value={EFilterType.HAVING}>HAVING</Select.Option>
                      </Select>
                    </Form.Item>
                  </>
                );
              }
              return <></>;
            }}
          </Form.Item>
        </Card>
      </Form>
    </Modal>
  );
}

export default React.forwardRef(FormModal);
