import { GroupOutlined, ImportOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Card, Form } from 'antd';
import { useContext, useRef, useState } from 'react';
import FormModal from './components/FormModal';
import React from 'react';
import FormListTag from '../FormListTag';
import { ConfigPanelContext } from '../..';
import BatchFormModal from './components/BatchFormModal';

/** 分组表单 */
function GroupForm({
  disabled = false,
  form,
  beforeConfirm,
}: {
  disabled?: boolean;
  form: any;
  beforeConfirm?: (values: any[], next: () => void) => void;
}) {
  const [modalVisiable, setModalVisiable] = useState<boolean>(false);
  const [batchModalVisiable, setBatchModalVisiable] = useState<boolean>(false);
  const modalFormRef = useRef<any>();
  const batchModalFormRef = useRef<any>();
  const { columns, viz_type, dictMappings } = useContext(ConfigPanelContext);
  const groups = Form.useWatch('groupby', form);

  return (
    <>
      <Card size="small" title={undefined} bodyStyle={{ padding: '2px' }}>
        <Form.Item
          noStyle
          shouldUpdate={(prevValues, curValues) => prevValues.metrics !== curValues.metrics}
        >
          {({ getFieldValue, setFieldValue }) => {
            const groupby = getFieldValue('groupby') || [];
            return (
              <>
                <Form.Item name="groupby" noStyle initialValue={[]}>
                  {groupby.map((g: any) => {
                    return (
                      <FormListTag
                        id={`${g?.field}`}
                        closable
                        icon={<GroupOutlined />}
                        onDelete={() => {
                          const gList: any[] = getFieldValue('groupby');
                          setFieldValue(
                            'groupby',
                            gList.filter((f) => f?.field !== g?.field),
                          );
                        }}
                        clickable={!disabled}
                        onClick={() => {
                          modalFormRef.current?.setInitValues(g);
                          setModalVisiable(true);
                        }}
                      >
                        {(() => {
                          if (g?.display_name) {
                            return g?.display_name;
                          }
                          const { name, comment } =
                            columns?.find((column) => column.name === g?.field) || {};
                          return <div>{comment || name || g?.field}</div>;
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
            新增分组
          </Button>
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
      </Card>
      <FormModal
        ref={modalFormRef}
        open={modalVisiable}
        setOpen={setModalVisiable}
        label={'分组'}
        groups={groups}
        viz_type={viz_type}
        columns={columns}
        dictMappings={dictMappings}
        onFinish={(values) => {
          const list = [...(form.getFieldValue('groupby') || []), values];
          const submit = () => {
            form.setFieldValue('groupby', list);
            setModalVisiable(false);
          };
          if (beforeConfirm) {
            beforeConfirm(list, submit);
          } else {
            submit();
          }
        }}
        onUpdate={(field, values) => {
          const list = [...(form.getFieldValue('groupby') || [])];
          const index = list.findIndex((i) => i?.field === field);
          if (index >= 0) {
            list.splice(index, 1, values);
          }
          const submit = () => {
            form.setFieldValue('groupby', list);
            setModalVisiable(false);
          };
          if (beforeConfirm) {
            beforeConfirm(list, submit);
          } else {
            submit();
          }
        }}
      />
      <BatchFormModal
        ref={batchModalFormRef}
        open={batchModalVisiable}
        setOpen={setBatchModalVisiable}
        label={'分组'}
        groups={groups}
        viz_type={viz_type}
        columns={columns}
        dictMappings={dictMappings}
        onFinish={(values) => {
          const list = [...(form.getFieldValue('groupby') || []), ...values];
          const submit = () => {
            form.setFieldValue('groupby', list);
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

export default React.forwardRef(GroupForm);
