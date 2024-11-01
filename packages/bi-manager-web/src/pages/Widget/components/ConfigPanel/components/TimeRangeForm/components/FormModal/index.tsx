import {
  Button,
  Checkbox,
  Col,
  DatePicker,
  Form,
  InputNumber,
  Modal,
  Radio,
  Row,
  Select,
} from 'antd';
import { ETimeSelectType, ETimeUnit, IFormTimeRange } from '../../../../typings';
import { getRelativeTime } from '@bi/common';
import { useImperativeHandle, useState } from 'react';
import React from 'react';
import moment, { Moment } from 'moment';
const { RangePicker } = DatePicker;

/**
 * 可选择的时间范围
 */
export const SELECTABLE_TIME_RANGE = [
  {
    label: '最近30分钟',
    value: 'now-30m',
    range: 30,
    unit: 'm',
  },
  {
    label: '最近1小时',
    value: 'now-1H',
    range: 1,
    unit: 'H',
  },
  {
    label: '最近6小时',
    value: 'now-6H',
    range: 6,
    unit: 'H',
  },
  {
    label: '最近12小时',
    value: 'now-12H',
    range: 12,
    unit: 'H',
  },
  {
    label: '最近1天',
    value: 'now-1d',
    range: 1,
    unit: 'd',
  },
  {
    label: '最近3天',
    value: 'now-3d',
    range: 3,
    unit: 'd',
  },
  {
    label: '最近5天',
    value: 'now-5d',
    range: 5,
    unit: 'd',
  },
  {
    label: '最近1周',
    value: 'now-1w',
    range: 1,
    unit: 'w',
  },
  {
    label: '最近1月',
    value: 'now-1M',
    range: 1,
    unit: 'M',
  },
];

const SELECTABLE_TIME_RANGE_MAP: any = SELECTABLE_TIME_RANGE.reduce((prev, curr) => {
  return {
    ...prev,
    [curr.value]: curr,
  };
}, {});

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
  const selectableTimeRange = Form.useWatch('selectable_time_range', modalForm);
  /** 自定义时间 */
  const [custom, setCustom] = useState<[Moment, Moment]>([] as any);
  const range = Form.useWatch('range', modalForm);
  const unit = Form.useWatch('unit', modalForm);
  const type = Form.useWatch('type', modalForm);
  // 命令式的给`ref.current`赋值个对象
  useImperativeHandle(ref, () => ({
    setInitValues: (values: Record<string, any>) => {
      modalForm.setFieldsValue({
        ...values,
        range: -values?.range,
        selectable_time_range: (() => {
          if (values.type === 'range') {
            return `now${values.range}${values.unit}`;
          }
          return undefined;
        })(),
      });
      if (values.type === 'custom') {
        setCustom([moment(values?.custom[0]), moment(values?.custom[1])]);
      } else if (values.type === 'range') {
        setCustom([moment(), moment().subtract(values.unit, Math.abs(values.range))]);
      }
    },
    reset: () => {
      modalForm.resetFields();
    },
  }));

  return (
    <Modal
      open={open}
      title={`创建${label}`}
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
            disabled={(() => {
              if (type === ETimeSelectType.RANGE) {
                return !range || !unit;
              } else {
                return !custom;
              }
            })()}
            onClick={async () => {
              const values = await modalForm.validateFields();
              const { range, unit, type } = values || {};
              const currentTime = new Date().valueOf();
              const relativeTime = getRelativeTime(range * -1, unit as any, currentTime);
              const startTime =
                custom && custom[0]
                  ? custom[0].format('YYYY-MM-DDTHH:mm:ss+0800')
                  : moment(relativeTime).format();
              const endTime =
                custom && custom[1]
                  ? custom[1].format('YYYY-MM-DDTHH:mm:ss+0800')
                  : moment(currentTime).format();
              onFinish({
                ...values,
                ...(type === ETimeSelectType.RANGE
                  ? {
                      custom: [moment(relativeTime).format(), moment(currentTime).format()],
                      range: range * -1,
                      unit,
                      label: `最近${range}${(ETimeUnit as any)[unit]}`,
                    }
                  : {
                      custom: [startTime, endTime],
                      range: range * -1,
                      unit,
                      label: `${moment(startTime).format('YYYY-MM-DD HH:mm:ss')} - ${moment(
                        endTime,
                      ).format('YYYY-MM-DD HH:mm:ss')}`,
                    }),
              } as IFormTimeRange);
              modalForm.resetFields();
            }}
            type="primary"
          >
            创建
          </Button>
        </>
      }
      destroyOnClose
      bodyStyle={{ padding: '20px 0px' }}
    >
      <Form form={modalForm}>
        <Form.Item name="type" initialValue={'range'} noStyle />
        <Form.Item name="custom" noStyle initialValue={[]} />
        <RangePicker
          style={{ margin: '25px' }}
          showTime={{ format: 'HH:mm:ss' }}
          value={custom as any}
          format="YYYY-MM-DD HH:mm:ss"
          onOk={(timeRange) => {
            if (timeRange?.length === 2) {
              modalForm.setFieldValue('type', ETimeSelectType.CUSTOM);
              setCustom([moment(timeRange[0]), moment(timeRange[1])]);
            }
          }}
        />
        <Form.Item
          name="selectable_time_range"
          {...{
            wrapperCol: { span: 24 },
          }}
        >
          <Radio.Group
            style={{ marginLeft: '25px' }}
            value={selectableTimeRange}
            onChange={(e) => {
              if (e.target.value === 'custom') {
                modalForm.setFieldValue('selectable_time_range', e.target.value);
                return;
              }
              const { unit, range } = SELECTABLE_TIME_RANGE_MAP[e.target.value];
              modalForm.setFieldsValue({
                type: ETimeSelectType.RANGE,
                unit,
                range,
                selectable_time_range: e.target.value,
              });
            }}
          >
            <Row>
              {SELECTABLE_TIME_RANGE.map((t) => {
                return (
                  <Col span={12}>
                    <Radio style={{ marginBottom: '10px' }} value={t.value}>
                      {t.label}
                    </Radio>
                  </Col>
                );
              })}
              <Col span={24}>
                <Radio value={'custom'} />
                <Form.Item noStyle name="range">
                  <InputNumber
                    disabled={selectableTimeRange !== 'custom'}
                    addonBefore="最近"
                    min={0}
                  />
                </Form.Item>
                <Form.Item noStyle name="unit">
                  <Select style={{ width: '100px' }} disabled={selectableTimeRange !== 'custom'}>
                    {Object.keys(ETimeUnit).map((key) => {
                      return (
                        <Select.Option key={key} value={key}>
                          {(ETimeUnit as any)[key]}
                        </Select.Option>
                      );
                    })}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          </Radio.Group>
          <Form.Item name="include_lower" noStyle valuePropName="checked">
            <Checkbox style={{ margin: '10px 25px' }}>包含开始时间</Checkbox>
          </Form.Item>
          <Form.Item name="include_upper" noStyle valuePropName="checked">
            <Checkbox>包含结束时间</Checkbox>
          </Form.Item>
        </Form.Item>
      </Form>
    </Modal>
  );
}

export default React.forwardRef(FormModal);
