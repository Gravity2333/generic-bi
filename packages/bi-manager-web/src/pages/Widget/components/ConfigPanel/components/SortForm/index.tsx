import { PlusOutlined, SortAscendingOutlined } from '@ant-design/icons';
import { Button, Card, Form, Switch } from 'antd';
import { useRef, useState } from 'react';
import FormModal from './components/FormModal';
import { ESortDirection, formatMetric } from '@bi/common';
import React from 'react';
import FormListTag from '../FormListTag';

/** 标志线表单 */
function SortForm({
  disabled = false,
  form,
  beforeConfirm,
}: {
  disabled?: boolean;
  form: any;
  beforeConfirm?: (values: any[], next: () => void) => void;
}) {
  const [modalVisiable, setModalVisiable] = useState<boolean>(false);
  const modalFormRef = useRef<any>();

  return (
    <>
      <Card size="small" title={undefined} bodyStyle={{ padding: '2px' }}>
        <Form.Item
          noStyle
          shouldUpdate={(prevValues, curValues) => prevValues.sorts !== curValues.sorts}
        >
          {({ getFieldValue, setFieldValue }) => {
            const sorts = getFieldValue('sorts') || [];
            return (
              <>
                <Form.Item name="sorts" noStyle initialValue={[]}>
                  {sorts.map((s: any) => {
                    return (
                      <FormListTag
                        id={`${s[0]?.id}`}
                        closable
                        onDelete={() => {
                          const sList: any[] = getFieldValue('sorts');
                          setFieldValue(
                            'sorts',
                            sList.filter((f) => f?.id !== s?.id),
                          );
                        }}
                        icon={<SortAscendingOutlined />}
                        clickable={!disabled}
                        onClick={() => {
                          modalFormRef.current?.setInitValues({
                            ...s[0],
                            direction: s[1],
                          });
                          setModalVisiable(true);
                        }}
                      >
                        {(() => {
                          /** Metric 排序方向 ,id,label */
                          const { direction, id } = s[0];
                          return (
                            <div>
                              {formatMetric({
                                ...(s[0] || {}),
                                comment: s[3],
                              })}
                              <Switch
                                style={{ marginLeft: '10px' }}
                                disabled={disabled}
                                onChange={(e) => {
                                  const sList: any[] = getFieldValue('sorts');
                                  const index = sList.findIndex((s) => s[0]?.id === id);
                                  const d = e ? ESortDirection.Asc : ESortDirection.Desc;
                                  if (index >= 0) {
                                    sList.splice(index, 1, [
                                      {
                                        ...s[0],
                                        direction: d,
                                      },
                                      d,
                                    ]);
                                  }
                                  form.setFieldValue('sorts', sList);
                                }}
                                onClick={(_, e) => {
                                  e.stopPropagation();
                                }}
                                size="small"
                                checkedChildren="升序"
                                unCheckedChildren="降序"
                                defaultChecked={direction === ESortDirection.Asc}
                                key={direction}
                              />
                            </div>
                          );
                        })()}
                      </FormListTag>
                    );
                  })}
                </Form.Item>
              </>
            );
          }}
        </Form.Item>
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
            新增排序字段
          </Button>
        </Form.Item>
      </Card>
      <FormModal
        ref={modalFormRef}
        open={modalVisiable}
        setOpen={setModalVisiable}
        label={'排序字段'}
        onFinish={(values) => {
          const sorts = [
            ...(form.getFieldValue('sorts') || []),
            [values, values?.direction || ESortDirection.Asc],
          ];
          const submit = () => {
            form.setFieldValue('sorts', sorts);
            setModalVisiable(false);
          };
          if (beforeConfirm) {
            beforeConfirm(sorts[0], submit);
          } else {
            submit();
          }
        }}
        onUpdate={(id, values) => {
          const list = [...(form.getFieldValue('sorts') || [])];
          const index = list.findIndex((i) => i[2] === id || (i[0] && i[0].id === id));
          if (index >= 0) {
            list.splice(index, 1, [values, values?.direction || ESortDirection.Asc]);
          }
          const submit = () => {
            form.setFieldValue('sorts', list);
            setModalVisiable(false);
          };
          if (beforeConfirm) {
            beforeConfirm(
              list.map((item) => item[0]),
              submit,
            );
          } else {
            submit();
          }
        }}
      />
    </>
  );
}

export default React.forwardRef(SortForm);
