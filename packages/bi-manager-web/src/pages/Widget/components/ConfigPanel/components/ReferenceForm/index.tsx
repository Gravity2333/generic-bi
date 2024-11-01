import { LineOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Card, Form } from 'antd';
import { useRef, useState } from 'react';

import FormModal from './components/FormModal';
import { formatMetric } from '@bi/common';
import React from 'react';
import FormListTag from '../FormListTag';

/** 标志线表单 */
function ReferenceForm({ disabled = false, form }: { disabled?: boolean; form: any }) {
  const [modalVisiable, setModalVisiable] = useState<boolean>(false);
  const modalFormRef = useRef<any>();

  return (
    <>
      <Card size="small" title={undefined} bodyStyle={{ padding: '2px' }}>
        <Form.Item
          noStyle
          shouldUpdate={(prevValues, curValues) => prevValues.reference !== curValues.reference}
        >
          {({ getFieldValue, setFieldValue }) => {
            const reference = getFieldValue('reference') || [];
            return (
              <>
                <Form.Item name="reference" noStyle initialValue={[]}>
                  {reference.map((r: any) => {
                    return (
                      <FormListTag
                        id={`${r?.id}`}
                        closable
                        onDelete={() => {
                          const rList: any[] = getFieldValue('reference');
                          setFieldValue(
                            'reference',
                            rList.filter((f) => f?.id !== r?.id),
                          );
                        }}
                        icon={<LineOutlined />}
                        clickable={!disabled}
                        onClick={() => {
                          modalFormRef.current?.setInitValues(r);
                          setModalVisiable(true);
                        }}
                      >
                        {r.display_name || formatMetric(r)}
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
              modalFormRef.current.reset()
              setModalVisiable(true);
            }}
            disabled={disabled}
            style={{ width: '100%' }}
            icon={<PlusOutlined />}
          >
            新增标志线
          </Button>
        </Form.Item>
      </Card>
      <FormModal
        ref={modalFormRef}
        open={modalVisiable}
        setOpen={setModalVisiable}
        label={'标志线'}
        onFinish={(values) => {
          form.setFieldValue('reference', [...form.getFieldValue('reference')||[], values]);
          setModalVisiable(false);
        }}
        onUpdate={(id,values)=>{
          const list = [...form.getFieldValue('reference')||[]]
          const index = list.findIndex(i=>i?.id === id)
          if(index>=0){
            list.splice(index,1,values)
          }
          form.setFieldValue('reference', list);
          setModalVisiable(false);
        }}
      />
    </>
  );
}

export default React.forwardRef(ReferenceForm);
