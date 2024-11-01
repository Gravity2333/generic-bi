import {
  AlignLeftOutlined,
  BarChartOutlined,
  FieldNumberOutlined,
  FieldTimeOutlined,
  LineChartOutlined,
  PieChartOutlined,
  PlusOutlined,
  TableOutlined,
} from '@ant-design/icons';
import { Button, Card, Form } from 'antd';
import { useRef, useState } from 'react';
import FormModal from './components/FormModal';
import React from 'react';
import FormListTag from '../FormListTag';
import { CHART_TYPE_LIST, EVisualizationType, getMatchedInterval } from '@bi/common';

/** 度量表单 */
function VizTypeForm({ disabled = false, form }: { disabled?: boolean; form: any }) {
  const [modalVisiable, setModalVisiable] = useState<boolean>(false);
  const modalFormRef = useRef<any>();

  return (
    <>
      <Card size="small" title={undefined} bodyStyle={{ padding: '2px' }}>
        <Form.Item
          noStyle
          shouldUpdate={(prevValues, curValues) => prevValues.viz_type !== curValues.viz_type}
        >
          {({ getFieldValue }) => {
            const v = getFieldValue('viz_type');
            return (
              <>
                {v && (
                  <Form.Item name="viz_type" noStyle>
                    <FormListTag
                      id={`viz_type`}
                      icon={
                        v === EVisualizationType.BigNumberTotal ? (
                          <FieldNumberOutlined />
                        ) : v === EVisualizationType.TimeHistogram ? (
                          <LineChartOutlined />
                        ) : v === EVisualizationType.Bar ? (
                          <AlignLeftOutlined />
                        ) : v === EVisualizationType.Column ? (
                          <BarChartOutlined />
                        ) : v === EVisualizationType.Time_Column ? (
                          <BarChartOutlined />
                        ) : v === EVisualizationType.Pie ? (
                          <PieChartOutlined />
                        ) : v === EVisualizationType.Table ? (
                          <TableOutlined />
                        ) : (
                          ''
                        )
                      }
                      clickable={!disabled}
                      onClick={() => {
                        modalFormRef.current?.setInitValues(v);
                        setModalVisiable(true);
                      }}
                    >
                      {CHART_TYPE_LIST.find((c) => c?.value === v)?.label}
                    </FormListTag>
                  </Form.Item>
                )}
                {!v && (
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
                      选择图表类型
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
        label={'图表类型'}
        onFinish={(values) => {
          form.setFieldsValue({ ...values });
          setModalVisiable(false);
        }}
      />
    </>
  );
}

export default React.forwardRef(VizTypeForm);
