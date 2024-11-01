import { FieldTimeOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Card, Form } from 'antd';
import { useRef, useState } from 'react';
import FormModal from './components/FormModal';
import React from 'react';
import FormListTag from '../FormListTag';
import { getMatchedInterval } from '@bi/common';

/** 度量表单 */
function TimeRangeForm({ disabled = false, form }: { disabled?: boolean; form: any }) {
  const [modalVisiable, setModalVisiable] = useState<boolean>(false);
  const modalFormRef = useRef<any>();

  return (
    <>
      <Card size="small" title={undefined} bodyStyle={{ padding: '2px' }}>
        <Form.Item
          noStyle
          shouldUpdate={(prevValues, curValues) => prevValues.time_range !== curValues.time_range}
        >
          {({ getFieldValue }) => {
            const timeRange = getFieldValue('time_range');
            return (
              <>
                {timeRange && (
                  <Form.Item name="time_range" noStyle>
                    <FormListTag
                      id={`time_range`}
                      icon={<FieldTimeOutlined />}
                      clickable={!disabled}
                      onClick={() => {
                        modalFormRef.current?.setInitValues(timeRange);
                        setModalVisiable(true);
                      }}
                    >
                      {timeRange?.label}
                    </FormListTag>
                  </Form.Item>
                )}
                {!timeRange && (
                  <Form.Item style={{ margin: '0px' }}>
                    <Button
                      type="dashed"
                      onClick={() => {
                        modalFormRef.current.reset();
                        setModalVisiable(true);
                      }}
                      disabled={disabled}
                      style={{ width: '100%' }}
                      icon={<PlusOutlined />}
                    >
                      新增时间范围
                    </Button>
                  </Form.Item>
                )}
              </>
            );
          }}
        </Form.Item>
      </Card>
      <FormModal
        ref={modalFormRef}
        open={modalVisiable}
        setOpen={setModalVisiable}
        label={'时间范围'}
        onFinish={(values) => {
          const [startTime, endTime] = values?.custom || [];
          const time_grain = getMatchedInterval(startTime, endTime);
          form.setFieldsValue({
            time_range: values,
            time_grain: time_grain || '5m',
          });
          setModalVisiable(false);
        }}
      />
    </>
  );
}

export default React.forwardRef(TimeRangeForm);
