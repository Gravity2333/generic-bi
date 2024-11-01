import { FunctionOutlined, ImportOutlined, PlusOutlined, TableOutlined } from '@ant-design/icons';
import { Button, Card, Form } from 'antd';
import { useRef, useState } from 'react';
import FormModal from './components/FormModal';
import { IMetric, formatMetric } from '@bi/common';
import React from 'react';
import FormListTag from '../FormListTag';
import BatchFormMetricsModal from './components/BatchFormMetricsModal';

/** 度量表单 */
function MetricForm({
  disabled = false,
  form,
  columnMode = false,
  beforeConfirm,
}: {
  disabled?: boolean;
  form: any;
  columnMode?: boolean;
  beforeConfirm?: (values: any[], next: (newList?: any[]) => void) => void;
}) {
  const [modalVisiable, setModalVisiable] = useState<boolean>(false);
  const [batchModalVisiable, setBatchModalVisiable] = useState<boolean>(false);
  const modalFormRef = useRef<any>();
  const batchModalFormRef = useRef<any>();
  return (
    <>
      <Card size="small" title={undefined} bodyStyle={{ padding: '2px' }}>
        <Form.Item
          noStyle
          shouldUpdate={(prevValues, curValues) => prevValues.metrics !== curValues.metrics}
        >
          {({ getFieldValue, setFieldValue }) => {
            const metrics = getFieldValue('metrics') || [];
            return (
              <>
                <Form.Item name="metrics" noStyle initialValue={[]}>
                  {metrics
                    .filter((metric: any) => {
                      if (columnMode) {
                        return !!metric.columnMode;
                      } else {
                        return !metric.columnMode;
                      }
                    })
                    .map((m: any) => {
                      return (
                        <FormListTag
                          id={`${m?.id}`}
                          closable
                          icon={columnMode ? <TableOutlined /> : <FunctionOutlined />}
                          onDelete={() => {
                            const mList: any[] = getFieldValue('metrics');
                            setFieldValue(
                              'metrics',
                              mList.filter((f) => f?.id !== m?.id),
                            );
                          }}
                          clickable={!disabled}
                          onClick={() => {
                            modalFormRef.current?.setInitValues(m);
                            setModalVisiable(true);
                          }}
                        >
                          {m.display_name || formatMetric(m)}
                        </FormListTag>
                      );
                    })}
                </Form.Item>
              </>
            );
          }}
        </Form.Item>
        {columnMode ? (
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
              新增表格展示列
            </Button>
          </Form.Item>
        ) : (
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
              新增度量
            </Button>
          </Form.Item>
        )}
        {columnMode ? (
          <Form.Item style={{ margin: '0px' }}>
            <Button
              type="dashed"
              onClick={() => {
                batchModalFormRef.current.reset();
                setBatchModalVisiable(true);
              }}
              disabled={disabled}
              style={{ width: '100%' }}
              icon={<ImportOutlined />}
            >
              批量添加
            </Button>
          </Form.Item>
        ) : null}
      </Card>
      <FormModal
        ref={modalFormRef}
        open={modalVisiable}
        setOpen={setModalVisiable}
        label={columnMode ? '表格展示列' : '度量'}
        columnMode={columnMode}
        onFinish={(values) => {
          const list = [...(form.getFieldValue('metrics') || []), values];
          const submit = (newList?: any[]) => {
            form.setFieldValue('metrics', newList || list);
            setModalVisiable(false);
          };
          if (beforeConfirm) {
            beforeConfirm(list, submit);
          } else {
            submit();
          }
        }}
        onUpdate={(id, values) => {
          const list = [...(form.getFieldValue('metrics') || [])];
          const index = list.findIndex((i) => i?.id === id);
          if (index >= 0) {
            list.splice(index, 1, values);
          }
          const submit = (newList?: any[]) => {
            form.setFieldValue('metrics', newList || list);
            setModalVisiable(false);
          };
          if (beforeConfirm) {
            beforeConfirm(list, submit);
          } else {
            submit();
          }
        }}
      />
      <BatchFormMetricsModal
        ref={batchModalFormRef}
        open={batchModalVisiable}
        setOpen={setBatchModalVisiable}
        label={'表格展示列'}
        onFinish={(values) => {
          let list = [...(form.getFieldValue('metrics') || []), ...values];
          const submit = () => {
            form.setFieldValue('metrics', list);
            setModalVisiable(false);
          };
          if (beforeConfirm) {
            beforeConfirm(list, submit);
          } else {
            submit();
          }
        }}
      />
    </>
  );
}

export default React.forwardRef(MetricForm);
