import { ETimeSelectType, ETimeUnit } from '@/pages/Widget/components/ConfigPanel/typings';
import { queryAllDashboards } from '@/services/dashboard';
import { createReport, queryReportDetail, updateReport } from '@/services/report';
import {
  EAttachmentSource,
  EAttachmentType,
  ECronType,
  EReportSenderType,
  getRelativeTime,
  IDashboardFormData,
  IEmailSenderOptions,
  ISnapShotSenderOptions,
  ITimeRange,
  IWidgetFormData,
  parseObjJson,
} from '@bi/common';
import {
  Button,
  Card,
  Checkbox,
  Col,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Menu,
  message,
  Modal,
  Popover,
  Radio,
  Row,
  Select,
} from 'antd';
import moment, { Moment } from 'moment';
import { useEffect, useMemo, useState } from 'react';
import Cron from 'react-js-cron';
import { history, useLocation, useParams } from 'umi';
import { v4 as uuidv4 } from 'uuid';
import { CHINESE_LOCALE, MAIL_SUFFIX_LIST } from './dict';
import { queryAllWidgets } from '@/services';
import Privacy from '@/components/Privacy';
import useEmbed from '@/hooks/useEmbed';

const FormItem = Form.Item;
const { Option } = Select;
const { TextArea } = Input;
const formItemLayout = {
  labelCol: { span: 3 },
  wrapperCol: { span: 18 },
};

const { RangePicker } = DatePicker;

export default function ReportForm({ type }: { type: 'create' | 'update' }) {
  /** 编辑模式下id */
  const { id } = useParams<{ id: string }>();
  /** 表单 */
  const [form] = Form.useForm();
  /** dashboard列表 */
  const [dashboardList, setDashboardList] = useState<IDashboardFormData[]>([]);
  /** widgets列表 */
  const [widgetList, setWidgetList] = useState<IWidgetFormData[]>([]);
  /** exec time */
  const [execTime, setExecTime] = useState<Moment>(moment());
  /** Cron类型 */
  const [cronType, setCronType] = useState<ECronType>(ECronType.Repeat);
  /** 发送类型 */
  const [senderType, setSenderType] = useState<EReportSenderType>(EReportSenderType.Email);
  const [privacy, setPrivacy] = useState<boolean>(false);
  /** 执行计划 */
  const [cron, setCron] = useState<string>('0 10 * * 1');
  /** 收件人地址提示 */
  const [recvTips, setRecvTips] = useState<any[]>([]);

  /** 全局time_range */
  const [timeRange, setTimeRange] = useState<ITimeRange>();
  /** 弹出框开关 */
  const [timeRangeHide, setTimeRangeHide] = useState<boolean>(true);
  const [embed] = useEmbed();
  /** 验证收件人 */
  const validateReceiver = (_: any, value: string[], callback: any) => {
    const receiverList = value;
    const regExp = /^\n?[.a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/;
    receiverList.forEach((receiver) => {
      if (!receiver.match(regExp) && receiver) {
        callback(`收件人:${receiver}格式错误!`);
        return;
      }
    });
    callback();
  };

  /** 检查单一邮件地址 */
  const valuedateMailAddr = (value: string) => {
    const regExp = /^\n?[.a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/;
    return (
      value.match(regExp) &&
      MAIL_SUFFIX_LIST.find((suffix) => value.match(new RegExp(suffix + '$')))
    );
  };

  /** 编辑模式下查询详情 */
  const queryDetails = async () => {
    const { success, data } = await queryReportDetail(id);
    if (!success) {
      return;
    }
    const {
      name,
      cron_type,
      exec_time,
      sender_type,
      sender_options,
      timezone,
      description,
      cron,
      global_time_range,
    } = data;
    /** 设置cron */
    setCron(cron);
    /** 获得邮件详情 */
    const oldAttachment = {
      // 兼容旧数据
      attachment_source: EAttachmentSource.DASHBOARD,
      attachment_type: EAttachmentType.PDF,
      dashboard_ids: data.dashboard_ids,
    };
    if (sender_type === EReportSenderType.Email) {
      const {
        receiver_emails,
        content,
        subject,
        attachment,
        timeout = 600,
      } = (JSON.parse(sender_options) as IEmailSenderOptions) || {};

      const {
        attachment_source,
        attachment_type,
        widget_ids = [],
        dashboard_ids = [],
      } = attachment || oldAttachment;

      form.setFieldsValue({
        name,
        sender_type,
        timeout,
        timezone,
        description,
        receiver_emails,
        content,
        subject,
        dashboard_ids,
        attachment_source,
        attachment_type,
        widget_ids,
        cron_type: cron_type || ECronType.Repeat,
      });
    } else if (sender_type == EReportSenderType.Snapshot) {
      const { attachment, timeout = 600 } =
        (JSON.parse(sender_options) as ISnapShotSenderOptions) || {};

      const {
        attachment_source,
        attachment_type,
        widget_ids = [],
        dashboard_ids = [],
      } = attachment || oldAttachment;
      form.setFieldsValue({
        name,
        sender_type,
        timezone,
        timeout,
        description,
        attachment_source,
        attachment_type,
        widget_ids,
        dashboard_ids,
        cron_type: cron_type || ECronType.Repeat,
      });
    }

    setCronType(cron_type || ECronType.Repeat);
    setSenderType(sender_type);
    setExecTime(moment(exec_time || undefined));
    if (global_time_range && global_time_range !== '{}') {
      setTimeRange(parseObjJson<ITimeRange>(global_time_range));
    }
  };

  /** 提交表单 */
  const submitForm = async () => {
    const {
      name,
      // timezone,
      sender_type,
      description,
      content,
      receiver_emails,
      subject,
      attachment_type,
      attachment_source,
      dashboard_ids,
      widget_ids,
      timeout,
    } = form.getFieldsValue();
    const senderOptions: IEmailSenderOptions | ISnapShotSenderOptions = (() => {
      const attachment = {
        attachment_type,
        attachment_source,
        ...(() => {
          if (attachment_source === EAttachmentSource.DASHBOARD) {
            return {
              dashboard_ids,
            };
          } else if (attachment_source === EAttachmentSource.WIDGET) {
            return {
              widget_ids,
            };
          }
          return {};
        })(),
      };
      if (sender_type === EReportSenderType.Email) {
        return {
          attachment,
          receiver_emails,
          subject,
          content,
          timeout,
        };
      } else {
        return {
          attachment,
          timeout,
        };
      }
    })();
    const saveObj = {
      name,
      // 兼容旧数据
      dashboard_ids: dashboard_ids || widget_ids,
      cron_type: cronType,
      cron: cron,
      timezone: 'Asia/Shanghai',
      sender_type: sender_type,
      description,
      sender_options: JSON.stringify(senderOptions),
      exec_time: moment(execTime).format('YYYY-MM-DD HH:mm'),
      global_time_range: JSON.stringify(timeRange) || '{}',
    };
    Modal.confirm({
      title: '确定保存吗？',
      onOk: async () => {
        const { success } = await (id ? updateReport({ ...saveObj, id }) : createReport(saveObj));
        if (success) {
          message.success('保存成功');
          if (embed) {
            history.push('/embed/report');
          } else {
            history.push('/report');
          }
        } else {
          message.error('保存失败');
        }
      },
    });
  };

  /** 初始化 */
  useEffect(() => {
    /** 加载所有dashboard */
    queryAllDashboards({}).then(({ success, data }) => {
      setDashboardList(success ? data : []);
    });
    /** 加载所有图表 */
    queryAllWidgets().then(({ success, data }) => {
      setWidgetList(success ? data : []);
    });
    /** 编辑模式下，加载详情信息 */
    if (type === 'update' && id !== undefined) {
      queryDetails();
    }
  }, []);

  /** 渲染时间选择框 */
  const renderTimeSelector = (type: ETimeSelectType) => {
    const [selectType, setSelectType] = useState<ETimeSelectType>(type || ETimeSelectType.RANGE);
    /** 时间范围 */
    const [range, setRange] = useState<number>(30);
    /** 时间单位 */
    const [unit, setUnit] = useState<string>('m');
    /** 自定义时间 */
    const [custom, setCustom] = useState<[Moment, Moment]>([moment(), moment()]);
    /** 包含开始时间 */
    const [lower, setLower] = useState<boolean>(false);
    /** 包含结束时间 */
    const [upper, setUpper] = useState<boolean>(false);

    useEffect(() => {
      if (timeRange) {
        const { type, custom, include_lower, include_upper, range, unit } = timeRange;
        setSelectType(type as ETimeSelectType);
        setRange(range * -1);
        setUnit(unit);
        setLower(include_lower);
        setUpper(include_upper);
        if (custom) {
          setCustom([moment(custom[0]), moment(custom[1])]);
        }
      }
    }, [timeRangeHide]);

    return (
      <div style={{ width: 400 }}>
        <Menu
          mode={'horizontal'}
          onClick={({ key }) => {
            setSelectType(key as ETimeSelectType);
          }}
          selectedKeys={[selectType]}
        >
          <Menu.Item key="range">相对时间</Menu.Item>
          <Menu.Item key="custom">自定义时间</Menu.Item>
        </Menu>
        {(() => {
          if (selectType === ETimeSelectType.RANGE) {
            /** 相对时间 */
            return (
              <div>
                <Row style={{ margin: '20px' }}>
                  <Col
                    span={2}
                    style={{
                      lineHeight: '30px',
                      marginRight: '10px',
                    }}
                  >
                    最近
                  </Col>
                  <Col span={8}>
                    <InputNumber
                      style={{ width: '100%' }}
                      min={0}
                      value={range}
                      onChange={(val) => setRange(val!)}
                    ></InputNumber>
                  </Col>
                  <Col span={6}>
                    <Select
                      style={{ width: '100%' }}
                      value={unit}
                      onSelect={(u: any) => setUnit(u)}
                    >
                      {Object.keys(ETimeUnit).map((key) => {
                        return (
                          <Option value={key} key={key}>
                            {(ETimeUnit as any)[key]}
                          </Option>
                        );
                      })}
                    </Select>
                  </Col>
                </Row>
              </div>
            );
          }
          if (selectType === ETimeSelectType.CUSTOM) {
            /** 自定义时间 */
            return (
              <Row style={{ margin: '20px' }}>
                <Col>
                  <RangePicker
                    showTime={{ format: 'HH:mm:ss' }}
                    value={custom as any}
                    format="YYYY-MM-DD HH:mm:ss"
                    onOk={(timeRange) => {
                      if (timeRange?.length === 2) {
                        setCustom([moment(timeRange[0]), moment(timeRange[1])]);
                      }
                    }}
                  />
                </Col>
              </Row>
            );
          }
        })()}
        <Row style={{ margin: '20px' }}>
          <Col>
            <Checkbox checked={lower} onChange={(e) => setLower(e.target.checked)}>
              包含开始时间
            </Checkbox>
          </Col>
          <Col>
            <Checkbox checked={upper} onChange={(e) => setUpper(e.target.checked)}>
              包含结束时间
            </Checkbox>
          </Col>
        </Row>
        <Row>
          <Col offset={13}>
            <Button
              type="primary"
              onClick={() => {
                const startTime = custom[0].format('YYYY-MM-DDTHH:mm:ss+0800');
                const endTime = custom[1].format('YYYY-MM-DDTHH:mm:ss+0800');
                const currentTime = new Date().valueOf();
                const relativeTime = getRelativeTime(range * -1, unit as any, currentTime);
                setTimeRange({
                  include_lower: lower,
                  include_upper: upper,
                  type: selectType,
                  ...(selectType === ETimeSelectType.RANGE
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
                        label: `${startTime} - ${endTime}`,
                      }),
                } as any);
                setTimeRangeHide(true);
              }}
              disabled={(() => {
                if (selectType === ETimeSelectType.RANGE) {
                  return !range || !unit;
                } else {
                  return !custom;
                }
              })()}
            >
              确定
            </Button>
          </Col>
          <Col offset={1}>
            <Button
              onClick={() => {
                setTimeRangeHide(true);
              }}
            >
              返回
            </Button>
          </Col>
        </Row>
      </div>
    );
  };

  const Attachment = (
    <>
      <FormItem name="attachment_source" label="附件来源" initialValue={EAttachmentSource.WIDGET}>
        <Radio.Group
          onChange={(e) => {
            if (e.target.value === EAttachmentSource.DASHBOARD) {
              form.setFieldValue('attachment_type', EAttachmentType.PDF);
            }
          }}
        >
          <Radio value={EAttachmentSource.DASHBOARD}>仪表盘</Radio>

          <Radio value={EAttachmentSource.WIDGET}>图表</Radio>
        </Radio.Group>
      </FormItem>
      <FormItem
        noStyle
        shouldUpdate={(prevValues, currentValues) =>
          prevValues.attachment_source !== currentValues.attachment_source
        }
      >
        {({ getFieldValue }) => {
          const attachment_source = getFieldValue('attachment_source');
          if (attachment_source === EAttachmentSource.DASHBOARD) {
            return (
              <FormItem
                name="dashboard_ids"
                label="仪表盘"
                rules={[{ required: true, message: '请选择至少一个仪表盘' }]}
              >
                <Select mode="multiple" allowClear placeholder="请选择仪表盘">
                  {dashboardList?.map((dashboard) => (
                    <Option key={dashboard.id} value={dashboard.id}>
                      {dashboard.name}
                    </Option>
                  ))}
                </Select>
              </FormItem>
            );
          } else if (attachment_source === EAttachmentSource.WIDGET) {
            return (
              <FormItem
                name="widget_ids"
                label="图表"
                rules={[{ required: true, message: '请选择至少一个图表' }]}
              >
                <Select mode="multiple" allowClear placeholder="请选择图表">
                  {widgetList?.map((widget) => (
                    <Option key={widget.id} value={widget.id}>
                      {widget.name}
                    </Option>
                  ))}
                </Select>
              </FormItem>
            );
          } else {
            return <></>;
          }
        }}
      </FormItem>
      <FormItem
        noStyle
        shouldUpdate={(prevValues, currentValues) =>
          prevValues.attachment_source !== currentValues.attachment_source
        }
      >
        {({ getFieldValue }) => {
          const type = getFieldValue('attachment_source');
          return (
            <FormItem name="attachment_type" label="附件类型" initialValue={EAttachmentType.EXCEL}>
              <Radio.Group>
                <Radio disabled={type !== EAttachmentSource.WIDGET} value={EAttachmentType.EXCEL}>
                  EXCEL
                </Radio>
                <Radio disabled={type !== EAttachmentSource.WIDGET} value={EAttachmentType.CSV}>
                  CSV
                </Radio>
                <Radio value={EAttachmentType.PDF}>PDF</Radio>
              </Radio.Group>
            </FormItem>
          );
        }}
      </FormItem>
    </>
  );

  return (
    <Card title="报表" size={'small'}>
      <Row style={{ margin: '30px 0px' }}>
        <Col span={22} offset={1}>
          <Form
            layout="horizontal"
            name="report"
            form={form}
            onFinish={submitForm}
            {...formItemLayout}
          >
            <FormItem name="name" label="名称" rules={[{ required: true }]}>
              <Input placeholder="请输入名称" />
            </FormItem>
            {/* <FormItem name="dashboard_ids" label="仪表盘" rules={[{ required: true }]}>
              <Select mode="multiple" allowClear placeholder="请选择仪表盘">
                {dashboardList?.map((dashboard) => (
                  <Option key={dashboard.id} value={dashboard.id}>
                    {dashboard.name}
                  </Option>
                ))}
              </Select>
            </FormItem> */}
            <FormItem name="cron_type" label="执行方式" initialValue={cronType}>
              <Radio.Group
                onChange={(e) => {
                  setCronType(e.target.value);
                }}
              >
                <Radio value={ECronType.Repeat}>循环执行</Radio>
                <Radio value={ECronType.Once}>单次执行</Radio>
              </Radio.Group>
            </FormItem>
            {cronType === ECronType.Once ? (
              <FormItem label="执行时间">
                <DatePicker
                  format="YYYY-MM-DD HH:mm"
                  showTime={{ defaultValue: moment('00:00:00', 'HH:mm') }}
                  onChange={(e) => {
                    if (e) {
                      setExecTime(e);
                    }
                  }}
                  value={execTime}
                />
              </FormItem>
            ) : (
              <FormItem label="执行计划">
                <Cron
                  locale={CHINESE_LOCALE}
                  value={cron}
                  setValue={setCron}
                  clockFormat="24-hour-clock"
                ></Cron>
              </FormItem>
            )}
            {/* <FormItem name="timezone" label="时区" rules={[{ required: true }]}>
              <Select showSearch placeholder="请选择时区">
                {timeZone.map((val) => (
                  <Option key={val} value={val}>
                    {val}
                  </Option>
                ))}
              </Select>
            </FormItem> */}
            {/* <FormItem name="sender_type" label="处理方式" initialValue={senderType}>
              <Radio.Group
                onChange={(e) => {
                  setSenderType(e.target.value);
                }}
              >
                <Radio value={EReportSenderType.Email}>邮箱外发</Radio>
                <Radio value={EReportSenderType.Snapshot}>快照</Radio>
              </Radio.Group>
            </FormItem> */}
            <Row>
              <Col span={18} offset={3} style={{ marginBottom: '20px' }}>
                <Card
                  title="外发内容"
                  size="small"
                  extra={
                    <FormItem name="sender_type" noStyle initialValue={senderType}>
                      <Radio.Group
                        onChange={(e) => {
                          setSenderType(e.target.value);
                        }}
                        size="small"
                        optionType="button"
                        buttonStyle="solid"
                      >
                        <Radio value={EReportSenderType.Email}>邮件</Radio>
                        <Radio value={EReportSenderType.Snapshot}>快照</Radio>
                      </Radio.Group>
                    </FormItem>
                  }
                >
                  <FormItem
                    label="全局时间"
                    rules={[{ required: true, message: '请选择全局时间' }]}
                  >
                    <Popover
                      placement="bottom"
                      content={renderTimeSelector as any}
                      trigger="click"
                      visible={!timeRangeHide}
                      onVisibleChange={(visible) => {
                        setTimeRangeHide(!visible);
                      }}
                    >
                      <Select
                        style={{ width: '400px' }}
                        allowClear
                        placeholder="请选择时间范围"
                        open={false}
                        value={(timeRange as any)?.label}
                        onClear={() => {
                          setTimeRange(undefined);
                        }}
                      />
                    </Popover>
                  </FormItem>
                  {senderType === EReportSenderType.Email ? (
                    <>
                      <FormItem
                        name="receiver_emails"
                        label="收件人"
                        rules={[{ required: true }, { validator: validateReceiver }]}
                      >
                        <Select
                          mode="tags"
                          style={{ width: '100%' }}
                          placeholder="请输入收件人"
                          onBlur={() => {
                            setRecvTips([]);
                          }}
                          open={recvTips.length !== 0}
                          onSearch={(value: string) => {
                            setRecvTips([]);
                            setRecvTips(
                              MAIL_SUFFIX_LIST.map((suffix) => {
                                let fullAddr = `${value}${suffix}`;
                                let newSuffix = suffix;
                                while (!valuedateMailAddr(fullAddr) && newSuffix) {
                                  newSuffix = newSuffix.slice(1);
                                  fullAddr = `${value}${newSuffix}`;
                                }
                                return newSuffix;
                              })
                                .filter((newSuffix) => newSuffix !== '')
                                .map((suffix) => {
                                  const tipValue = `${value}${suffix}`;
                                  return (
                                    <Option key={uuidv4()} value={tipValue}>
                                      {tipValue ? tipValue : []}
                                    </Option>
                                  );
                                }),
                            );
                          }}
                        >
                          {recvTips}
                        </Select>
                      </FormItem>
                      <FormItem
                        name="subject"
                        label="邮件标题"
                        rules={[{ max: 255, message: '输入超过限制' }]}
                      >
                        <TextArea rows={1} placeholder="请输入邮件标题" />
                      </FormItem>
                      {Attachment}
                      <FormItem
                        name="content"
                        label="邮件正文"
                        rules={[{ max: 255, message: '输入超过限制' }]}
                      >
                        <TextArea
                          rows={5}
                          placeholder={
                            '请输入邮件正文\n使用@startTime，@endTime插入查询时间到邮件正文/标题中'
                          }
                        />
                      </FormItem>
                    </>
                  ) : (
                    Attachment
                  )}
                </Card>
              </Col>
            </Row>
            <FormItem
              name="description"
              label="备注"
              rules={[{ max: 255, message: '输入超过限制' }]}
            >
              <TextArea rows={5} placeholder="请输入备注信息" />
            </FormItem>
            <FormItem
              label="超时时间"
              name="timeout"
              initialValue={600}
              required
              rules={[{ required: true, message: '请输入超时时间' }]}
            >
              <InputNumber min={1} precision={0} placeholder="超时时间默认10分钟" addonAfter="秒" />
            </FormItem>
            <Row style={{ margin: '20px 0px' }}>
              <Col offset={3}>
                <Privacy onChange={(p) => setPrivacy(p)} />
              </Col>
            </Row>
            <Row>
              <Col offset={3}>
                <Button disabled={!privacy} type="primary" onClick={() => {}} htmlType="submit">
                  保存
                </Button>
              </Col>
              <Col style={{ marginLeft: '10px' }}>
                <Button
                  onClick={() => {
                    if (embed) {
                      history.push('/embed/report');
                    } else {
                      history.push('/report');
                    }
                  }}
                >
                  取消
                </Button>
              </Col>
            </Row>
          </Form>
        </Col>
      </Row>
    </Card>
  );
}
