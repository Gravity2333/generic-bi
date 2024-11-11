import EditableTitle from '@/components/EditableTitle';
import ReactGridLayout from '@/components/GridLayout';
import { IGridLayoutItem, SEPARATOR_ID } from '@/components/GridLayout/typings';
import { ETimeSelectType, ETimeUnit } from '@/pages/Widget/components/ConfigPanel/typings';
import { createDashboard, updateDashboard } from '@/services/dashboard';
import downloadAsImage from '@/utils/downloadAsImage';
import { downloadPdf } from '@/services/dashboard';
import { MoreOutlined } from '@ant-design/icons';
import {
  getRelativeTime,
  IDashboardFormData,
  IDashboardSpecification,
  ITimeRange,
  parseObjJson,
  getMatchedInterval,
  getTimeRange,
  mergeTimeRange,
} from '@bi/common';
import {
  Button,
  Checkbox,
  Col,
  DatePicker,
  Dropdown,
  InputNumber,
  Menu,
  MenuProps,
  message,
  Modal,
  Popover,
  Row,
  Select,
  Space,
} from 'antd';
import moment from 'moment';
import { Moment } from 'moment';
import { useEffect, useState, createContext, useRef, useContext } from 'react';
import { history } from 'umi';
import { v4 as uuidv4 } from 'uuid';
import styles from './index.less';
import FullScreenCard from '@/components/FullScreenCard';
import HorizontalComponentPane from '../components/HorizontalComponentPane';
import { isDev } from '@/common';
import { COMPONENT_TYPE_LIST } from '../components/HorizontalComponentAdder/typing';
import { cancelAllQuery } from '@/services';
import { DashboardContext, IDashboardContext } from '@/layouts/DashboardLayout';
import { EBACKGROUNDTYPE } from '../components/HorizontalBackground/typing';
import { SET_DASHBOARD_BACKGOUNRD } from '@/utils/layout';

const { Option } = Select;
const { RangePicker } = DatePicker;

const encodeMap = (map: Map<string, any>) => {
  let result: Record<string, any> = {};
  map.forEach((v: any, k: string) => {
    result[k] = v;
  });
  return result;
};

const decodeMap = (obj: Record<string, any>) => {
  const m = new Map();
  Object.keys(obj).forEach((k) => {
    m.set(k, obj[k]);
  });
  return m;
};

export interface ITimeRangeContext {
  time_range: ITimeRange;
  time_grain?: '1m' | '5m' | '1h';
  setTimeRange: (range: ITimeRange) => void;
}
export const TimeRangeContext = createContext<any>({});

enum DashboardOperationKey {
  /** 另存为 */
  'SaveAs' = 'save_as',
  /** 编辑 */
  'Update' = 'update',
  /** 下载图片 */
  'DowloadAsImage' = 'dowload_as_image',
  /** 全屏 */
  'Fullscreen' = 'fullscreen',
  /** 保存为pdf */
  'DownloadAsPdf' = 'download_as_pdf',
}

const checkTimeAvailabel = (timeRange: ITimeRange) => {
  if (timeRange?.type === ETimeSelectType.CUSTOM) {
    return (
      timeRange?.custom &&
      timeRange?.custom?.length === 2 &&
      timeRange?.custom[0] &&
      timeRange?.custom[1]
    );
  } else if (timeRange?.type === ETimeSelectType.RANGE) {
    return (
      timeRange?.range !== undefined && timeRange?.range !== null && !Number.isNaN(timeRange?.range)
    );
  }
  return false;
};

interface IDashboardEditorProps {
  dashboard?: IDashboardFormData;
  embed?: boolean;
  /** 是否是查看模式 */
  preview?: boolean;
  /** 简约试图模式 */
  tab?: boolean;
}

export default function DashboardEditor({
  dashboard,
  embed = false,
  preview = false,
  tab = false,
}: IDashboardEditorProps) {
  const { id, name, specification } = dashboard || {};
  const [dashboardName, setDashboardName] = useState<string>(name || '[ 未命名仪表盘 ]');
  /** 全屏 */
  const [fullScreen, setFullScreen] = useState<boolean>();
  /** 全局时间范围 */
  const [timeRange, setTimeRange] = useState<ITimeRange>();
  /** 展示时间范围 */
  const [showTimeRange, setShowTimeRange] = useState<ITimeRange>();
  /** 弹出框开关 */
  const [timeRangeHide, setTimeRangeHide] = useState<boolean>(true);
  /** 背景 */
  const [background, _setBackground] = useState<EBACKGROUNDTYPE>(EBACKGROUNDTYPE.EMPTY);
  const setDashboardBackGround = (b: EBACKGROUNDTYPE) => {
    SET_DASHBOARD_BACKGOUNRD(b);
    _setBackground(b);
  };
  const layoutInfoFunc = useRef<any>();

  const [texts, setTexts] = useState<Map<string, any>>(new Map());
  // contextkey
  const [contextKey, setContextKey] = useState<string>(uuidv4());

  // 内置仪表盘
  const [readonly, setReadonly] = useState<boolean>(false);

  const { location, pageEmbed, rangeFromOutSystem } =
    useContext<IDashboardContext>(DashboardContext);

  const handleCancel = () => {
    Modal.confirm({
      title: '确定放弃所有修改吗？',
      onOk: async () => {
        if (pageEmbed) {
          history.push(`/embed/dashboard/tab${(location as any)?.search}`);
        } else {
          history.push('/dashboard');
        }
      },
    });
  };
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
                setContextKey(uuidv4());
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

  const handleSave = () => {
    const widgetIdSet = new Set();
    let layouts = [] as IGridLayoutItem[];
    if (layoutInfoFunc.current) {
      layouts = layoutInfoFunc.current();
    }
    texts.forEach(({ tabLayouts, tableLayouts }) => {
      const embedLayputs = [...(tabLayouts || []), ...(tableLayouts || [])];
      embedLayputs.forEach(({ i }: { i: string }) => {
        const widget_id = i.split(SEPARATOR_ID)[1];
        if (COMPONENT_TYPE_LIST.findIndex((t) => t === widget_id) < 0) {
          widgetIdSet.add(widget_id);
        }
      });
    });
    layouts.forEach((el) => {
      const widget_id = el?.i.split(SEPARATOR_ID)[1];
      if (COMPONENT_TYPE_LIST.findIndex((t) => t === widget_id) < 0) {
        widgetIdSet.add(widget_id);
      }
    });
    const data: IDashboardFormData = {
      name: dashboardName,
      specification: JSON.stringify({
        layouts,
        time_range: timeRange,
        texts: texts ? encodeMap(texts) : {},
        background,
      }),
      readonly: readonly ? '1' : '0',
      // @ts-ignore
      widget_ids: [...widgetIdSet],
    };

    Modal.confirm({
      title: '确定保存吗？',
      onOk: async () => {
        const { success } = await (id
          ? updateDashboard({ ...data, id: dashboard?.id! })
          : createDashboard(data));
        if (success) {
          message.success('保存成功');
          if (pageEmbed) {
            history.push(`/embed/dashboard/tab${(location as any)?.search}`);
          } else {
            history.push('/dashboard');
          }
        } else {
          message.error('保存失败');
        }
      },
    });
  };

  // 下拉按钮点击事件
  const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
    switch (key) {
      case DashboardOperationKey.DowloadAsImage:
        downloadAsImage(
          '#dashboard-content',
          // eslint-disable-next-line camelcase
          dashboardName ?? 'New chart',
        );
        break;
      case DashboardOperationKey.DownloadAsPdf:
        id && downloadPdf(id);
        break;
      case DashboardOperationKey.Fullscreen:
        setFullScreen(!fullScreen);
        break;
      case DashboardOperationKey.Update:
        if (pageEmbed) {
          history.push(`/embed/dashboard/${id}/update`);
        } else {
          history.push(`/dashboard/${id}/update`);
        }
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    const {
      time_range,
      texts,
      background: back,
    } = parseObjJson<IDashboardSpecification>(specification || '');
    setReadonly(dashboard?.readonly === '1');
    setTexts(texts ? decodeMap(texts) : new Map());
    setDashboardBackGround(back || (EBACKGROUNDTYPE.EMPTY as any));
    setContextKey(uuidv4());
    if (!tab) {
      setTimeRange(time_range);
    }
    return () => {
      cancelAllQuery();
    };
  }, []);

  useEffect(() => {
    if (checkTimeAvailabel(rangeFromOutSystem!)) {
      setTimeRange(rangeFromOutSystem);
      setContextKey(uuidv4());
    }
  }, [rangeFromOutSystem]);

  const toolMenu = (
    <Space>
      {!preview && (
        <>
          <Button onClick={handleCancel}>放弃修改</Button>
          <Button type="primary" onClick={handleSave} disabled={!isDev && readonly}>
            保存
          </Button>
        </>
      )}
      <Dropdown
        overlay={
          <Menu onClick={handleMenuClick}>
            {preview && !readonly && <Menu.Item key={DashboardOperationKey.Update}>编辑</Menu.Item>}
            <Menu.Item key={DashboardOperationKey.DowloadAsImage}>保存为图片</Menu.Item>
            <Menu.Item key={DashboardOperationKey.DownloadAsPdf}>保存为PDF</Menu.Item>
            {preview ? <Menu.Item key={DashboardOperationKey.Fullscreen}>全屏</Menu.Item> : ''}
          </Menu>
        }
        trigger={['click']}
      >
        <MoreOutlined rotate={90} style={{ fontSize: 24 }} />
      </Dropdown>
    </Space>
  );
  return (
    <div className={styles['dashboard']} id="dashboard-content">
      {/* Title */}
      {!tab ? (
        <div className={styles['dashboard-header']}>
          <div className={styles['dashboard-header-title']}>
            <EditableTitle
              title={dashboardName}
              canEdit={!preview && !readonly}
              onSaveTitle={setDashboardName}
              showTooltip={false}
            />
          </div>
          <div className={styles['dashboard-header-extra']}>
            {timeRange || showTimeRange ? (
              <Space style={{ marginRight: '20px' }}>
                <span>时间范围:</span>
                <span>
                  {timeRange
                    ? getTimeRange(timeRange).join(' - ')
                    : showTimeRange
                    ? getTimeRange(showTimeRange!).join(' - ')
                    : ''}
                </span>
              </Space>
            ) : null}
            {!embed ? (
              <>
                <Space style={{ marginRight: '20px' }}>
                  <span>全局时间:</span>
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
                </Space>
                {isDev && !preview ? (
                  <Checkbox
                    checked={readonly}
                    onChange={(e) => {
                      setReadonly(e.target.checked);
                    }}
                  >
                    只读
                  </Checkbox>
                ) : null}
                {toolMenu}
              </>
            ) : null}
          </div>
        </div>
      ) : (
        <div style={{ position: 'relative' }}>
          <div
            style={{
              width: '100px;',
              position: 'absolute',
              right: '0px',
              top: '0px',
              zIndex: '10',
            }}
          >
            {toolMenu}
          </div>
        </div>
      )}
      <FullScreenCard fullScreen={fullScreen}>
        <div className={styles['dashboard-editor']}>
          <div className={styles['dashboard-content']}>
            <TimeRangeContext.Provider
              key={contextKey}
              value={{
                time_range: timeRange,
                time_grain: getMatchedInterval(timeRange?.custom[0]!, timeRange?.custom[1]!),
                setTimeRange: (range: ITimeRange) => {
                  if (!showTimeRange) {
                    setShowTimeRange(range);
                  } else {
                    setShowTimeRange(mergeTimeRange(showTimeRange, range));
                  }
                },
              }}
            >
              <ReactGridLayout
                key={id}
                initLayouts={
                  parseObjJson<IDashboardSpecification>(specification || '').layouts || []
                }
                layoutInfoFuncRef={layoutInfoFunc}
                readonly={preview || readonly}
                texts={texts}
              />
            </TimeRangeContext.Provider>
          </div>
        </div>
      </FullScreenCard>
      {!preview && !readonly && (
        <div>
          <HorizontalComponentPane setBackground={setDashboardBackGround} />
        </div>
      )}
    </div>
  );
}
