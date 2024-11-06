import { Form, Input, Modal, Select, Tag } from 'antd';
import {
  AXIS_FORMATTER_TYPE_LIST,
  EVisualizationType,
  IClickhouseColumn,
  IDictMapping,
  IGroupBy,
} from '@bi/common';
import { useContext, useImperativeHandle, useMemo, useState } from 'react';
import { BookOutlined } from '@ant-design/icons';
import React from 'react';
import { GlobalContext, IGlobalContext } from '@/layouts/GlobalLayout';
import { SimpleCustomTypeSwitch } from '@/components/SimpleCustomTypeSwitch';
import ColumnModeAlert from '../../../MetricForm/components/ColumnModeAlert';

const formItemLayout = {
  wrapperCol: { span: 24 },
};
function BatchFormModal(
  props: {
    open: boolean;
    setOpen: any;
    label: string;
    onFinish: (values: Record<string, any>[]) => void;
    columns: IClickhouseColumn[];
    groups: IGroupBy[];
    viz_type: EVisualizationType;
    dictMappings: IDictMapping[];
  },
  ref: any,
) {
  const { open, setOpen, label, onFinish, columns, groups, viz_type, dictMappings } = props;
  const [modalForm] = Form.useForm();
  const groupNameMap = useMemo(() => {
    const map = new Map();
    columns?.forEach((column) => {
      map.set(column.name, column.comment || column.name);
    });
    return map;
  }, [columns]);

  const { dicts = [] } = useContext<IGlobalContext>(GlobalContext);
  // 命令式的给`ref.current`赋值个对象
  useImperativeHandle(ref, () => ({
    reset: () => {
      modalForm.resetFields();
    },
  }));

  return (
    <Modal
      open={open}
      title={`批量添加${label}`}
      okText="添加"
      cancelText="取消"
      onCancel={() => {
        setOpen(false);
      }}
      centered
      onOk={async () => {
        const values = await modalForm.validateFields();
        onFinish &&
          onFinish(
            (values?.fields || []).map((field: string) => {
              const { dict_field } =
                dictMappings.find((mapping) => mapping.table_field === field) || {};
              const { type } = columns?.find((c) => c?.name === field) || {};
              return {
                field,
                dict_field: dict_field,
                type,
                ...(() => {
                  if (viz_type === EVisualizationType.Table) {
                    return {
                      display_name: groupNameMap.get(field),
                    };
                  }
                })(),
              };
            }),
          );
        setOpen(false);
      }}
      destroyOnClose
      bodyStyle={{ padding:'0px' }}
    >
      <Form form={modalForm}>
        <Form.Item style={{ position: 'relative', padding: '10px 0px', margin: '0px' }}>
          <ColumnModeAlert title="新增分组会清空当前表格展示列配置！"/>
          <Form.Item
            name="fields"
            wrapperCol={{offset:1,span: 22}}
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
              placement='topLeft'
              onChange={(field) => {
                const { dict_field } =
                  dictMappings.find((mapping) => mapping.table_field === field) || {};
                const { type } = columns?.find((c) => c?.name === field) || {};
                modalForm.setFieldsValue({
                  dict_field: dict_field,
                  type,
                });
              }}
              mode="multiple"
            >
              {columns?.map((item: any) => {
                return (
                  <Select.Option
                    disabled={!!groups?.find((group) => group.field === item.name)}
                    key={item.name}
                    value={item.name}
                    label={item.comment || item.name}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        width: '100%',
                        lineHeight:'24px'
                      }}
                    >
                      {item.comment || item.name}
                      {item.dict_field && (
                        <Tag color={'blue'} style={{ 
                          margin: '2px',
                          height: '18px',
                          lineHeight: '18px',
                          fontSize:'11px'
                          }} icon={<BookOutlined />}>
                          {dicts.find((dict) => dict.id === item.dict_field)?.name ||
                            item.dict_field}
                        </Tag>
                      )}
                    </div>
                  </Select.Option>
                );
              })}
            </Select>
          </Form.Item>
        </Form.Item>
      </Form>
    </Modal>
  );
}

export default React.forwardRef(BatchFormModal);
