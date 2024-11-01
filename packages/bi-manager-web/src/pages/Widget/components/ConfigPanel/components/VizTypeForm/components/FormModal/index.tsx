import { Button, Card, Form, List, Modal } from 'antd';
import { useImperativeHandle } from 'react';
import NUMBER_ICON from '../../assets/number.svg';
import TIMEHIST_ICON from '../../assets/timeHist.svg';
import BAR_ICON from '../../assets/bar.svg';
import COLUMN from '../../assets/column.svg';
import TIMECOLUMN_ICON from '../../assets/timeColumn.svg';
import TABLE_ICON from '../../assets/table.svg';
import PIE_ICON from '../../assets/pie.svg';
import React from 'react';
import styles from './index.less';
import { EVisualizationType } from '@bi/common';
import useDaynamicTheme from '@/hooks/useDynamicTheme';

function FormModal(
  props: {
    open: boolean;
    setOpen: any;
    label: string;
    onFinish: (values: Record<string, any>) => void;
  },
  ref: any,
) {
  const { open, setOpen, label, onFinish } = props;
  const [modalForm] = Form.useForm();
  const vizType = Form.useWatch('viz_type', modalForm);
  const [, isDark] = useDaynamicTheme();
  // 命令式的给`ref.current`赋值个对象
  useImperativeHandle(ref, () => ({
    setInitValues: (value: string) => {
      modalForm.setFieldsValue({
        viz_type: value,
      });
    },
    reset: () => {
      modalForm.resetFields();
    },
  }));

  return (
    <Modal
      open={open}
      title={`选择${label}`}
      okText="创建"
      cancelText="取消"
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
            onClick={async () => {
              const values = await modalForm.validateFields();
              onFinish(values);
              modalForm.resetFields();
            }}
            disabled={!vizType}
            type="primary"
          >
            确定
          </Button>
        </>
      }
      destroyOnClose
      bodyStyle={{ padding: '10px' }}
    >
      <Form form={modalForm}>
        <Form.Item name="viz_type" noStyle>
          <List
            grid={{ gutter: 10, column: 3 }}
            dataSource={[
              {
                title: '数字',
                value: EVisualizationType.BigNumberTotal,
                svg: (
                  <img draggable={false} src={NUMBER_ICON} alt="" style={{ fontSize: '100px' }} />
                ),
              },
              {
                title: '折线图',
                value: EVisualizationType.TimeHistogram,
                svg: (
                  <img draggable={false} src={TIMEHIST_ICON} alt="" style={{ fontSize: '100px' }} />
                ),
              },
              {
                title: '饼图',
                value: EVisualizationType.Pie,
                svg: <img draggable={false} src={PIE_ICON} alt="" style={{ fontSize: '100px' }} />,
              },
              {
                title: '柱状图',
                value: EVisualizationType.Column,
                svg: <img draggable={false} src={COLUMN} alt="" style={{ fontSize: '100px' }} />,
              },
              {
                title: '时间柱状图',
                value: EVisualizationType.Time_Column,
                svg: (
                  <img
                    draggable={false}
                    src={TIMECOLUMN_ICON}
                    alt=""
                    style={{ fontSize: '100px' }}
                  />
                ),
              },
              {
                title: '条形图',
                value: EVisualizationType.Bar,
                svg: <img draggable={false} src={BAR_ICON} alt="" style={{ fontSize: '100px' }} />,
              },
              {
                title: '表格',
                value: EVisualizationType.Table,
                svg: (
                  <img draggable={false} src={TABLE_ICON} alt="" style={{ fontSize: '100px' }} />
                ),
              },
            ]}
            renderItem={(item: any) => (
              <List.Item>
                <Card
                  title={undefined}
                  size="small"
                  className={styles.card}
                  style={{
                    background: vizType === item.value && isDark ? '#1890ff' : 'white',
                    boxShadow: vizType === item.value ? '0 0 20px rgba(0,0,0,0.8)' : '',
                    borderRadius: vizType === item.value ? '10px' : '',
                  }}
                  bodyStyle={{
                    padding: '0px',
                    height: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    position: 'relative',
                    caretColor: 'transparent',
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    modalForm.setFieldValue('viz_type', item.value);
                  }}
                >
                  {item.svg}
                  <div
                    style={{
                      position: 'absolute',
                      left: '0px',
                      bottom: '0px',
                      height: '30px',
                      lineHeight: '30px',
                      width: '100%',
                      textAlign: 'center',
                    }}
                  >
                    {item.title}
                  </div>
                </Card>
              </List.Item>
            )}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}

export default React.forwardRef(FormModal);
