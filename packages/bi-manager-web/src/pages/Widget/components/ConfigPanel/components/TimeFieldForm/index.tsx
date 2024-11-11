import { SimpleCustomTypeSwitch } from '@/components/SimpleCustomTypeSwitch';
import { IClickhouseColumn } from '@bi/common';
import { Form, Input, Select } from 'antd';

export function TimeFieldForm({
  timeColumns,
  disabled,
  required = false
}: {
  disabled: boolean;
  timeColumns: IClickhouseColumn[];
  required?: boolean
}) {
  return (
    <>
      <Form.Item style={{ position: 'relative', padding: '0px', margin: '0px' }}>
        <Form.Item
          noStyle
          shouldUpdate={(prev, curr) => prev.time_field_custom !== curr.time_field_custom}
        >
          {({ getFieldValue, setFieldValue }) => {
            const time_field_custom = getFieldValue('time_field_custom');
            if (time_field_custom === 'custom') {
              return (
                <Form.Item name="time_field" label="时间字段" rules={[{ required: required }]}>
                  <Input placeholder="请输入时间字段" />
                </Form.Item>
              );
            } else {
              return (
                <Form.Item name="time_field" label="时间字段" rules={[{ required: required }]}>
                  <Select
                    style={{ width: '100%' }}
                    placeholder="请选择时间字段"
                    disabled={disabled}
                    allowClear
                    onClear={()=>{
                      setFieldValue('time_range',undefined)
                    }}
                    onChange={(e) => {
                      setFieldValue(
                        'time_field_type',
                        timeColumns.find((c) => c?.name === e)?.type,
                      );
                    }}
                  >
                    {timeColumns
                      .map((item: any) => {
                        return (
                          <Select.Option key={item.name} value={item.name}>
                            {item.name}
                          </Select.Option>
                        );
                      })}
                  </Select>
                </Form.Item>
              );
            }
          }}
        </Form.Item>
        <div
          style={{
            position: 'absolute',
            lineHeight: '22px',
            fontSize: '10px',
            top: '-2px',
            left: '70px',
          }}
        >
          <Form.Item noStyle shouldUpdate>
            {({ setFieldValue }) => {
              return (
                <Form.Item noStyle name="time_field_custom" initialValue={'simple'}>
                  <SimpleCustomTypeSwitch
                    onSwitch={() => {
                      setFieldValue('time_field', undefined);
                    }}
                  />
                </Form.Item>
              );
            }}
          </Form.Item>
        </div>
      </Form.Item>
      {/* 时间字段类型 */}
      <Form.Item name="time_field_type" noStyle />
    </>
  );
}
