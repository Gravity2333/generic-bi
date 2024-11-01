import { cancelQueryWidgetData, createWidget, updateWidget, widgetExplore } from '@/services';
import { queryClichhouseTableColumns } from '@/services/dataset';
import {
  QuestionCircleOutlined,
  SaveOutlined,
  StopOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import {
  Button,
  Card,
  Checkbox,
  Divider,
  Form,
  Input,
  InputNumber,
  message,
  Select,
  Tabs,
  Modal,
  Popover,
} from 'antd';
import { history } from 'umi';
import {
  EFormatterType,
  EVisualizationType,
  IWidgetFormData,
  IWidgetSpecification,
  ChartProperties,
  AXIS_FORMATTER_TYPE_LIST,
  IDictMapping,
  INpmdDict,
  IClickhouseColumn,
  TableColumnType,
  IFormMetric,
  ICustomTime,
  IMetric,
} from '@bi/common';
import { useContext, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { useParams } from 'umi';
import { EFilterType, ICustomFilter } from './typings';
import { REFRESH_TIME_LIST } from './dict';
import ConfigDisplay from './components/ConfigDisplay';
import { queryDictMappings } from '@/services/dicts';
import { v4 as uuidv4 } from 'uuid';
import { ELoadingStatus, WidgetEditorContext } from '../../Editor';
import { isDev } from '@/common';
import { IReferenceResult } from '@bi/common';
import MetricForm from './components/MetricForm';
import React from 'react';
import ReferenceForm from './components/ReferenceForm';
import SortForm from './components/SortForm';
import FilterForm from './components/FilterForm';
import GroupForm from './components/GroupForm';
import TimeRangeForm from './components/TimeRangeForm';
import VizTypeForm from './components/VizTypeForm';
import { queryCustomTimes } from '@/services/global';
import TimeGrainSelect from './components/TimeGrainSelect';
import { TimeFieldForm } from './components/TimeFieldForm';
import TextArea from 'antd/lib/input/TextArea';
import useEmbed from '@/hooks/useEmbed';

const { Option } = Select;
const FormItem = Form.Item;
const { TabPane } = Tabs;

export const ConfigPanelContext = React.createContext<{
  columns: IClickhouseColumn[];
  viz_type: EVisualizationType;
  existRollup: boolean;
  dictMappings: IDictMapping[];
  metrics: IFormMetric[];
  changeStyles: (styles: ChartProperties) => void;
  isColumnMode?: boolean;
}>({} as any);

interface Props {
  /** widget变动回调函数 */
  onWidgetChange: (
    widget: IWidgetFormData,
    colNames: string[],
    colIdList: string[],
    queriesData: any,
    sql: string,
    explain: string,
    references?: IReferenceResult[],
  ) => void;
  /** 重置widget */
  resetWidget: () => void;
  /** 样式改变callback */
  onStyleChange: (chartProperties: ChartProperties) => void;
  /** specification变动 */
  onSpecificationChange: (specification: any) => void;
  /** 提交方法 */
  setSubmitFunc: (func: any) => any;
  onSubmit?: (values: any) => void;
  schemaDetails: any;
  defWidgetDetail: any;
  operateType: 'UPDATE' | 'CREATE';
  setLoading: any;
  setWidgetId: any;
  dicts: INpmdDict[];
  loading: ELoadingStatus;
}

/** 处理下拉框定位问题 */
const getPopupContainer = (triggerNode: { parentNode: any }) => {
  return triggerNode.parentNode || document.body;
};

function ConfigPanel(props: Props, ref: any) {
  const {
    onWidgetChange,
    resetWidget,
    onStyleChange,
    onSpecificationChange,
    setSubmitFunc,
    schemaDetails = [],
    defWidgetDetail,
    operateType,
    setLoading,
    setWidgetId,
    loading,
    onSubmit,
  } = props;
  const queryId = useRef<string>(uuidv4());
  const { tableColumns, setTableColums } = useContext(WidgetEditorContext);
  /** TAb */
  const [tabKey, setTabKey] = useState<'configuration' | 'display' | 'template'>('configuration');
  /** 表单 */
  const [form] = Form.useForm();
  /** 字典映射关系 */
  const [dictMappings, setDictMappings] = useState<IDictMapping[]>();
  /** 自定义时间 */
  const [customTimes, setCustomTimes] = useState<ICustomTime[]>([]);
  /** 图表id */
  const { widgetId } = useParams<any>();
  /** 是否开启预览模式 */
  const [isPreview, setIsPreview] = useState(true);
  /** 当前数据源 */
  const [currentSchema, setCurrentSchema] = useState<string>();
  /** 当前数据源对应字段 */
  const [currentColums, setCurrentColumns] = useState<IClickhouseColumn[]>([]);

  /** 表格类型 */
  const vizType = Form.useWatch('viz_type', form);
  /** 度量 */
  const metrics = Form.useWatch('metrics', form);
  /** 分组 */
  const groupby = Form.useWatch('groupby', form);
  /** 排序sorts */
  const sorts = Form.useWatch('sorts', form);
  /** 检查聚合 */
  function checkAggreate(
    type: 'groupby' | 'metrics' | 'sorts',
    values: any[] = [],
    next: (newMetrics?: any[]) => void = () => {},
  ) {
    if (
      vizType === EVisualizationType.Table &&
      (metrics || []).findIndex((metric: any) => !!metric.columnMode) >= 0 &&
      (type === 'groupby' || values.findIndex((val: any) => !!val.aggregate) >= 0)
    ) {
      Modal.confirm({
        centered: true,
        title: (() => {
          if (type === 'groupby') {
            return '设置分组会清空展示列，是否确认?';
          }
          if (type === 'metrics' || type === 'sorts') {
            return '设置聚合函数会清空展示列，是否确认?';
          }
          return '';
        })(),
        onOk: async () => {
          if (type === 'metrics') {
            const newMetrics = [...values.filter((metric: any) => !metric.columnMode)];
            next(newMetrics);
          } else {
            const newMetrics = [...metrics.filter((metric: any) => !metric.columnMode)];
            form.setFieldValue('metrics', newMetrics);
            next();
          }
        },
      });
    } else {
      next();
    }
  }

  /** 是否存在聚合 */
  const isAggre = useMemo(() => {
    const isGroup = groupby?.length > 0;
    const isMetricAgg = !!((metrics || []).findIndex((m: IMetric) => m.aggregate) >= 0);
    const isSortAgg = !!(
      (sorts || [])?.findIndex((m: [IMetric, 'asc' | 'desc']) => m?.[0].aggregate) >= 0
    );
    if (isGroup || isMetricAgg || isSortAgg) {
      /** 聚合情况下，清空展示列 */
      return true;
    }
    return false;
  }, [groupby, sorts, metrics]);

  /** table列集合 */
  const [columns, setColumns] = useState<TableColumnType[]>([]);
  /** 图表配置信息 */
  const [chartProperties, setChartProperties] = useState<Partial<ChartProperties>>();
  /** y轴格式化 */
  const [yAxisFormat, setYAxisFormat] = useState<string>('raw');
  /** 图表内嵌 */
  const [widgetEmbed, setWidgetEmbed] = useState<boolean>(false);
  const [embed] = useEmbed();

  /** 定时刷新时间 */
  const [readonly, setReadonly] = useState<boolean>(false);

  /** 数据源列表 */
  const schemaList = useMemo(() => {
    return (
      schemaDetails.map((item: any) => ({
        id: item.name,
        title: item.comment || item.name,
      })) || []
    );
  }, [schemaDetails]);

  const existRollup = useMemo(() => {
    return (
      schemaDetails.find((schema: any) => schema.name === currentSchema)?.exist_rollup || false
    );
  }, [currentSchema, schemaDetails]);

  /** 根据选择的表获取映射关系 */
  const fetchDictMapping = async () => {
    if (!currentSchema) {
      return;
    }
    const { success, data } = await queryDictMappings(currentSchema);
    if (!success) {
      return;
    }
    setDictMappings(data);
  };

  /** 改变数据源 */
  const changeSchema = () => {
    const { title, description, datasource } = form.getFieldsValue();
    form.resetFields();
    form.setFieldsValue({
      title,
      description,
      datasource,
    });
    resetWidget();
  };

  const fetchCustomTimes = async () => {
    const { success, data } = await queryCustomTimes();
    if (success) {
      setCustomTimes(Object.values(data));
    }
  };

  /** 提交表单 */
  const submitForm = async (val: any) => {
    const havings: any[] = [];
    const filters: any[] = [];
    const {
      viz_type,
      title,
      filters: filtersFromForm,
      sorts,
      groupby,
      template,
      templateCoverData,
    } = val;
    (filtersFromForm || []).forEach((item: any) => {
      if ((item as any)?.group === undefined) {
        if ((item as ICustomFilter).filter_type === EFilterType.HAVING) {
          havings.push((item as ICustomFilter).sql_expression);
        } else {
          filters.push({
            ...item,
            operator_label: null,
            filter_type: null,
            filter_select_type: null,
          });
        }
      } else {
        filters.push(item);
      }
    });

    const queryObj: IWidgetSpecification = {
      ...val,
      groupby: groupby || [],
      sorts: sorts.map((item: any) => item.slice(0, 2)),
      exist_rollup: existRollup,
      havings,
      filters,
      chart_properties: chartProperties,
      y_axis_format: yAxisFormat,
    };

    const saveObj: IWidgetFormData = {
      name: title,
      specification: JSON.stringify({
        ...queryObj,
        filtersFromForm,
        groupby: groupby || [],
        exist_rollup: existRollup,
        chart_properties: chartProperties,
        y_axis_format: yAxisFormat,
        widget_embed: widgetEmbed,
        columns,
        table_columns: tableColumns,
        templateCoverData: templateCoverData,
      }),
      description: val.description,
      readonly: readonly ? '1' : '0',
      template: template ? '1' : '0',
      datasource: val.datasource,
      viz_type,
    };
    onSubmit && onSubmit(queryObj);
    if (isPreview) {
      setLoading(ELoadingStatus.PENDING);
      queryId.current = uuidv4();
      /** 预览 */
      const { success, data: result } =
        (await widgetExplore({
          formData: queryObj,
          queryId: queryId.current,
        })) || {};

      if (!success) {
        setLoading(ELoadingStatus.FAILED);
        return;
      }
      const { data, colNames, sql, explain, colIdList, references = [] } = result;
      message.success('查询成功！');
      onWidgetChange(saveObj, colNames, colIdList, data, sql, explain, references);
      setLoading(ELoadingStatus.SUCCESS);
    } else {
      /** 保存 */
      if (operateType === 'CREATE') {
        /** 新建的情况 */
        const { success, data } = await createWidget(saveObj);
        if (success) {
          message.success('保存成功！');
          const { id } = data;
          const prevent_jump = form.getFieldValue('prevent_jump');

          if (!prevent_jump) {
            if (embed) {
              history.push(`/embed/widget/${id}/update`);
            } else {
              history.push(`/widget/${id}/update`);
            }
          }

          if (prevent_jump) {
            /** 设置createId */
            setWidgetId(id || '');
          }

          return;
        } else {
          message.error('保存失败！');
          return;
        }
      } else if (operateType === 'UPDATE') {
        /** 编辑的情况 */
        const { success } = await updateWidget({ ...saveObj, id: widgetId });
        if (success) {
          message.success('保存成功！');
        } else {
          message.error('保存失败！');
        }
        return;
      }
    }
  };

  /** 获取字段信息 */
  useEffect(() => {
    if (currentSchema) {
      queryClichhouseTableColumns(currentSchema)
        .then((res) => {
          setCurrentColumns(res.data);
        })
        .catch((err) => {});
      fetchDictMapping();
    }
  }, [currentSchema]);

  const changeStyles = (styles: ChartProperties) => {
    setChartProperties({ ...styles });
    onStyleChange(styles);
  };

  function updateConfigPanelValues(updateValues: any) {
    const {
      datasource,
      chart_properties,
      y_axis_format,
      columns,
      readonly,
      template,
      widget_embed,
      table_columns,
      filtersFromForm,
    } = updateValues;
    form.setFieldsValue({
      ...updateValues,
      filters: filtersFromForm,
      template: template === '1' || template === true,
    });

    setCurrentSchema(datasource);
    setIsPreview(true);
    setReadonly(readonly !== '0');
    setChartProperties(chart_properties);
    setWidgetEmbed(widget_embed);
    setTableColums(table_columns);
    setYAxisFormat(y_axis_format);
    setColumns(columns || []);
  }

  /** 编辑模式下，初始化表单数据 */
  useEffect(() => {
    if (Object.keys(defWidgetDetail)?.length > 0) {
      updateConfigPanelValues(defWidgetDetail);
    }
  }, []);

  const isMount = useRef(true);
  useEffect(() => {
    if (dictMappings && operateType === 'UPDATE' && isMount.current) {
      form
        .validateFields()
        .then(() => {
          setIsPreview(true);
          form.submit();
        })
        .catch(() => {});
      isMount.current = false;
    }
  }, [dictMappings]);

  useEffect(() => {
    /** 请求自定义时间 */
    fetchCustomTimes();
    /** 将提交函数传递出去 */
    setSubmitFunc(function () {
      return () => {
        form.setFieldsValue({ prevent_jump: true });
        return form
          .validateFields()
          .then(() => {
            setIsPreview(false);
            form.submit();
          })
          .catch(() => {})
          .finally(() => {
            form.setFieldsValue({ prevent_jump: true });
          });
      };
    });
    return () => {
      /** 退出时 清除所有请求 */
      cancelQueryWidgetData(queryId.current);
    };
  }, []);

  /** -----------     处理函数      -------------------------------------*/
  /** 处理数据源变化 */
  const handleDatasourceChange = (e: any) => {
    if (!currentSchema) {
      changeSchema();
      setCurrentSchema(e);
      return;
    }
    Modal.confirm({
      title: '更换数据源会清空图表配置!',
      onOk: () => {
        changeSchema();
        setCurrentSchema(e);
      },
      onCancel: () => {
        form.setFieldsValue({
          datasource: currentSchema,
        });
      },
    });
  };

  useImperativeHandle(
    ref,
    () => {
      return {
        update: (updateValues: any) => {
          updateConfigPanelValues(updateValues);
        },
        isTouched: () => {
          return form.isFieldsTouched();
        },
      };
    },
    [],
  );

  return (
    <ConfigPanelContext.Provider
      value={{
        columns: currentColums,
        viz_type: vizType,
        existRollup: !!existRollup,
        dictMappings: dictMappings || [],
        metrics,
        changeStyles,
        isColumnMode:
          vizType === EVisualizationType.Table &&
          (metrics || []).findIndex((metric: any) => !!metric.columnMode) >= 0,
      }}
    >
      <div>
        <Form
          layout="vertical"
          name="widget"
          form={form}
          onValuesChange={(changedValues) => {
            if (Object.keys(changedValues)[0] !== 'schemaName') {
            }
          }}
          onFinish={submitForm}
        >
          <Card
            title={null}
            size={'small'}
            bordered={false}
            style={{ width: '450px' }}
            bodyStyle={{ paddingTop: 0 }}
          >
            <Tabs
              defaultActiveKey="configuration"
              onChange={(key) => setTabKey(key as 'configuration' | 'display')}
              style={{ position: 'sticky', left: 0, top: 0, zIndex: 10, background: 'white' }}
            >
              <TabPane tab="图表配置" key="configuration"></TabPane>
              <TabPane
                tab="图表展示"
                key="display"
                disabled={vizType === undefined || readonly}
              ></TabPane>
              <TabPane
                tab="模板"
                key="template"
                disabled={vizType === undefined || readonly}
              ></TabPane>
            </Tabs>
            <div>
              <div style={{ display: `${tabKey === 'configuration' ? 'block' : 'none'}` }}>
                <Divider orientation="left">图表信息</Divider>
                {/* 图表名称 */}
                <FormItem
                  name="title"
                  label="图表名称"
                  rules={[
                    { required: true },
                    {
                      min: 2,
                      message: '最少请输入2个字符',
                    },
                    {
                      max: 32,
                      message: '最多限制32个字符',
                    },
                  ]}
                >
                  <Input disabled={readonly} />
                </FormItem>

                {/* 描述信息 */}
                <FormItem
                  name="description"
                  label="描述信息"
                  rules={[
                    {
                      max: 512,
                      message: '最多限制512个字符',
                    },
                  ]}
                >
                  <Input.TextArea disabled={readonly} />
                </FormItem>

                <Divider orientation="left">数据源 & 图表类型</Divider>
                {/* 数据源 */}
                <FormItem name="datasource" label="数据源" rules={[{ required: true }]}>
                  <Select
                    showSearch
                    optionFilterProp="label"
                    placeholder="请选择数据源"
                    getPopupContainer={getPopupContainer}
                    onChange={handleDatasourceChange}
                    style={{ width: '100%' }}
                    disabled={readonly}
                  >
                    {schemaList.length &&
                      schemaList.map((item: any) => (
                        <Option key={item.id} value={item.id} label={item.title}>
                          {item.title}
                        </Option>
                      ))}
                  </Select>
                </FormItem>

                {/* 图表类型 */}
                <FormItem
                  name="viz_type"
                  label="图表类型"
                  required
                  rules={[
                    {
                      validator: async () => {
                        if (!form.getFieldValue('viz_type')) {
                          throw new Error('请选择图表类型!');
                        }
                      },
                    },
                  ]}
                >
                  <VizTypeForm form={form} disabled={readonly} />
                </FormItem>
                <Divider orientation="left">数据查询</Divider>

                {/* 分组 */}
                {vizType !== EVisualizationType.Time_Column && (
                  <FormItem name="groupby" label="分组">
                    <GroupForm
                      beforeConfirm={checkAggreate.bind(null, 'groupby')}
                      form={form}
                      disabled={currentColums?.length === 0 || readonly}
                    />
                  </FormItem>
                )}

                {vizType === EVisualizationType.Table ? (
                  <>
                    {/* 展示列 */}
                    <FormItem
                      label={
                        <>
                          <span>表格展示列</span>
                          <Popover
                            style={{ padding: '5px' }}
                            placement="right"
                            content={
                              <div style={{ fontSize: '12px' }}>
                                <ul style={{ margin: '0px', paddingLeft: '10px' }}>
                                  <li>在此配置的列会直接展示在表格内，不对数据进行聚合或分组。</li>
                                  <li>
                                    如果对数据没有聚合或分组的需求，仅展示表格，此项配置会有更好的查询性能！
                                  </li>
                                  <li>⚠️ 此项配置无法和分组，度量/排序的聚合函数并存！</li>
                                </ul>
                              </div>
                            }
                            trigger="hover"
                          >
                            <QuestionCircleOutlined
                              style={{
                                cursor: 'help',
                                fontSize: '12px',
                                verticalAlign: '-2px',
                                marginLeft: '3px',
                              }}
                            />
                          </Popover>
                        </>
                      }
                      extra={isAggre ? '配置分组/聚合函数后，无法创建表格展示列!' : ''}
                    >
                      <MetricForm
                        form={form}
                        disabled={currentColums?.length === 0 || isAggre || readonly}
                        columnMode={true}
                      />
                    </FormItem>
                  </>
                ) : null}

                {/* 度量 */}
                <FormItem
                  name="metrics"
                  label="度量"
                  required={vizType !== EVisualizationType.Table}
                  rules={[
                    {
                      validator: async () => {
                        if (
                          form.getFieldValue('metrics')?.length === 0 &&
                          vizType !== EVisualizationType.Table
                        ) {
                          throw new Error('至少创建一个度量!');
                        }
                      },
                    },
                  ]}
                >
                  <MetricForm
                    beforeConfirm={checkAggreate.bind(null, 'metrics')}
                    form={form}
                    disabled={currentColums?.length === 0 || readonly}
                  />
                </FormItem>

                {/* 标志线 */}
                {vizType === EVisualizationType.TimeHistogram && (
                  <FormItem name="reference" label="标志线">
                    <ReferenceForm form={form} disabled={currentColums?.length === 0 || readonly} />
                  </FormItem>
                )}

                {/* 排序字段 */}
                <FormItem name="sorts" label="排序字段">
                  <SortForm
                    beforeConfirm={checkAggreate.bind(null, 'sorts')}
                    form={form}
                    disabled={currentColums?.length === 0 || readonly}
                  />
                </FormItem>

                {/* 数量限制 */}
                <FormItem
                  name="limit"
                  label="数量限制"
                  required
                  rules={[{ required: true, message: '请配置查询数量限制！' }]}
                  initialValue={100}
                >
                  <InputNumber
                    min={1}
                    style={{ width: '100%' }}
                    disabled={currentColums?.length === 0 || readonly}
                    placeholder="请输入数量限制"
                  ></InputNumber>
                </FormItem>

                {/* 过滤条件 */}
                <FormItem name="filters">
                  <FilterForm form={form} disabled={currentColums?.length === 0 || readonly} />
                </FormItem>

                <FormItem>
                  <Divider orientation="left">时间</Divider>
                  {/* 时间字段 */}
                  <TimeFieldForm
                    disabled={currentColums?.length === 0 || readonly}
                    timeColumns={currentColums?.filter(({ type }: { type: string }) =>
                      type.includes('DateTime'),
                    )}
                    required={[
                      EVisualizationType.TimeHistogram,
                      EVisualizationType.Time_Column,
                    ].includes(vizType)}
                  />
                  {/* 时间范围 */}
                  <FormItem
                    name="time_range"
                    label="时间范围"
                    rules={[
                      {
                        validator: async () => {
                          if (form.getFieldValue('time_field') && !form.getFieldValue('time_range')) {
                            throw new Error('请选择时间范围!');
                          }
                        },
                      },
                    ]}
                  >
                    <TimeRangeForm form={form} disabled={currentColums?.length === 0 || readonly} />
                  </FormItem>

                  {(() => {
                    if (vizType === EVisualizationType.TimeHistogram) {
                      return (
                        <FormItem
                          name="time_grain"
                          label="时间粒度"
                          extra={'默认时间粒度根据所选时间范围自动生成'}
                          initialValue={'1m'}
                        >
                          <TimeGrainSelect />
                        </FormItem>
                      );
                    } else {
                      return <FormItem name="time_grain" noStyle />;
                    }
                  })()}
                  {vizType !== EVisualizationType.TimeHistogram &&
                    vizType !== EVisualizationType.Time_Column && (
                      <FormItem name="custom_times" label="生效时间">
                        <Select
                          style={{ width: '100%' }}
                          allowClear={true}
                          placeholder="请选择生效时间"
                          disabled={currentColums?.length === 0 || readonly}
                        >
                          {(Array.isArray(customTimes) ? customTimes : []).map((time) => {
                            return <Option value={time.id}>{time.name}</Option>;
                          })}
                        </Select>
                      </FormItem>
                    )}
                  <FormItem name="refresh" noStyle valuePropName="checked">
                    <Checkbox disabled={readonly}>定时刷新</Checkbox>
                  </FormItem>

                  <Form.Item
                    noStyle
                    shouldUpdate={(prevValues, currentValues) =>
                      prevValues.refresh !== currentValues.refresh
                    }
                  >
                    {({ getFieldValue }) => {
                      const refresh = getFieldValue('refresh');
                      if (getFieldValue('refresh')) {
                        return (
                          <Card
                            style={{ marginTop: '10px' }}
                            size="small"
                            title={null}
                            bodyStyle={{ padding: '10px' }}
                          >
                            <FormItem
                              name="refresh_time"
                              label="刷新时间"
                              rules={[{ required: refresh }]}
                            >
                              <Select
                                style={{ width: '100%' }}
                                placeholder="请选择刷新时间"
                                disabled={readonly}
                              >
                                {REFRESH_TIME_LIST.map((time) => (
                                  <Option key={uuidv4()} value={time.value}>
                                    {time.name}
                                  </Option>
                                ))}
                              </Select>
                            </FormItem>
                          </Card>
                        );
                      }
                    }}
                  </Form.Item>
                </FormItem>
                {isDev ? (
                  <>
                    <Divider orientation="left">开发者选项[仅dev模式生效]</Divider>
                    <FormItem
                      name="readonly"
                      style={{ marginBottom: '60px' }}
                      extra="只读模式开启后，仅在开发模式下可以保存配置项"
                    >
                      <Checkbox
                        checked={readonly}
                        onChange={(e) => {
                          setReadonly(e.target.checked);
                        }}
                      >
                        只读
                      </Checkbox>
                    </FormItem>
                  </>
                ) : null}
              </div>
              <div
                style={{
                  display: `${tabKey === 'display' ? 'block' : 'none'}`,
                  paddingBottom: '30px',
                }}
              >
                {vizType && <ConfigDisplay defaultValues={chartProperties || {}} />}
                {vizType !== EVisualizationType.Table ? (
                  <FormItem label="Y轴格式化">
                    <Select
                      placeholder="请选择Y轴格式化"
                      getPopupContainer={getPopupContainer}
                      defaultValue={EFormatterType.Raw}
                      style={{ width: '100%' }}
                      onChange={(e) => {
                        setYAxisFormat(e);
                        onSpecificationChange({ y_axis_format: e });
                      }}
                      value={yAxisFormat}
                    >
                      {AXIS_FORMATTER_TYPE_LIST.map((type) => {
                        return (
                          <Option value={type.value} key={type.value}>
                            {type.label}
                          </Option>
                        );
                      })}
                    </Select>
                  </FormItem>
                ) : (
                  ''
                )}
                <FormItem
                  name="embed"
                  // style={{ marginBottom: '60px' }}
                  extra={'图表在仪表盘中展示时，将不再显示外框卡片'}
                >
                  <Checkbox
                    checked={widgetEmbed}
                    onChange={(e) => {
                      setWidgetEmbed(e.target.checked);
                    }}
                  >
                    图表内嵌
                  </Checkbox>
                </FormItem>
              </div>
              <div
                style={{
                  display: `${tabKey === 'template' ? 'block' : 'none'}`,
                  paddingBottom: '30px',
                }}
              >
                <FormItem valuePropName="checked" name="template">
                  <Checkbox defaultChecked={false}>保存为模板</Checkbox>
                </FormItem>
                {isDev ? (
                  <FormItem noStyle shouldUpdate={(prev, curr) => prev.template !== curr.template}>
                    {({ getFieldValue }) => {
                      const template = getFieldValue('template');
                      if (template) {
                        return (
                          <FormItem
                            name="templateCoverData"
                            label="模板封面数据"
                            extra={
                              '请填写模板封面展示option数据，此数据会渲染生成“图表模板选择”的卡片封面，如未填写，使用默认封面'
                            }
                          >
                            {(() => {
                              if (vizType === EVisualizationType.BigNumberTotal) {
                                return <Input placeholder="请填写展示文字" />;
                              }
                              if (vizType === EVisualizationType.Table) {
                                return (
                                  <TextArea rows={15} placeholder="请按照 [columns,data] 填写" />
                                );
                              }
                              return <TextArea rows={15} />;
                            })()}
                          </FormItem>
                        );
                      }
                    }}
                  </FormItem>
                ) : null}
              </div>
            </div>
          </Card>
          <Card
            bordered={false}
            title={null}
            size={'small'}
            style={{
              position: 'fixed',
              width: '440px',
              left: 0,
              bottom: 0,
              zIndex: 10,
              background: 'white',
            }}
          >
            {loading === ELoadingStatus.PENDING ? (
              <Button
                type="primary"
                danger
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  cancelQueryWidgetData(queryId.current);
                  setLoading(ELoadingStatus.FAILED);
                }}
                disabled={isDev ? false : readonly}
                icon={<StopOutlined />}
                style={{ marginRight: '10px' }}
              >
                取消查询
              </Button>
            ) : (
              <Button
                type="primary"
                onClick={() => {
                  setIsPreview(true);
                }}
                disabled={isDev ? false : readonly}
                icon={<ThunderboltOutlined />}
                htmlType="submit"
                style={{ marginRight: '10px' }}
              >
                执行查询
              </Button>
            )}
            <Divider type="vertical" />
            <Button
              type="primary"
              onClick={() => {
                setIsPreview(false);
              }}
              loading={loading === ELoadingStatus.PENDING}
              disabled={isDev ? false : readonly}
              icon={<SaveOutlined />}
              htmlType="submit"
              style={{ marginRight: '10px' }}
            >
              保存
            </Button>
            <Button
              onClick={() => {
                if (embed) {
                  history.push('/embed/widget');
                } else {
                  history.push('/widget');
                }
              }}
            >
              关闭
            </Button>
          </Card>
        </Form>
      </div>
    </ConfigPanelContext.Provider>
  );
}

export default React.memo(React.forwardRef(ConfigPanel));
