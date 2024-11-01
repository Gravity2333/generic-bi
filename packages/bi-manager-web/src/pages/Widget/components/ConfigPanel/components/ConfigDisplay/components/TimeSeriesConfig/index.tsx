import { Button, Card, Checkbox, Divider, Input, InputNumber, Select, Slider, Switch } from 'antd';
import PositionPanel from '../PositionPanel';
import FormItem from 'antd/es/form/FormItem';
import LegendPosSelector from '../LegendPosSelector';
import CustomFont from '../CustomFont';
import { CloseSquareOutlined, PlusSquareOutlined } from '@ant-design/icons';
import { IMenuType } from '../..';
import { EBrushMenuName, brushMenuType } from '../../../../typings';
import { v4 as uuidv4 } from 'uuid';
import SchemeColor from '../SchemeColor';
import { useContext, useEffect, useImperativeHandle } from 'react';
import { ConfigPanelContext } from '../../../..';
import {
  AXIS_FORMATTER_TYPE_LIST,
  EFormatterType,
  ELegendPosition,
  formatMetric,
  LegendPosDict,
} from '@bi/common';
import React from 'react';
import { DEFAULT_SCHEME_COLOR } from '../../../../dict';

function TimeSeriesConfig(
  {
    defaultValues,
    form,
  }: {
    defaultValues: any;
    form: any;
  },
  ref: any,
) {
  const { metrics } = useContext(ConfigPanelContext);
  const AddMenu = (
    menuItem: IMenuType,
    append: boolean = true,
    menu: IMenuType[],
    setMenu: any,
  ) => {
    if (append) {
      setMenu([...menu, menuItem]);
    } else {
      const index = menu.findIndex((item) => item.id == menuItem.id);
      if (index >= 0) {
        let newMenu = menu;
        newMenu[index] = menuItem;
        setMenu([...newMenu]);
      }
    }
  };

  const dropMenu = (id: string, menu: IMenuType[], setMenu: any) => {
    setMenu(menu.filter((m) => m.id !== id));
  };
  
  const init = () => {
    const { x, y, x2, y2 } = defaultValues.grid || {};
    const {
      is_smooth,
      dataZoom,
      legend,
      tooltip,
      is_stack,
      is_area,
      yAxis,
      xAxis,
      symbol,
      symbolSize,
      threshold,
      color,
      brush,
      menu,
      isColorRange,
      colorRange,
      rightYAxis,
      auto_size,
      custom_font_size,
    } = defaultValues;
    form.setFieldsValue({
      color: JSON.stringify(color || DEFAULT_SCHEME_COLOR),
      grid_x: parseInt(x || 50),
      grid_y: parseInt(y || 50),
      grid_x2: parseInt(x2 || 50),
      grid_y2: parseInt(y2 || 50),
      y_axis_name: yAxis?.name,
      x_axis_name: xAxis?.name,
      x_axis_label_rotate: xAxis?.axisLabel?.rotate,
      y_axis_label_rotate: yAxis?.axisLabel?.rotate,
      symbol_size: symbolSize || 8,
      threshold: threshold,
      smooth: is_smooth,
      dataZoom: !!dataZoom,
      isStack: is_stack,
      isArea: is_area === false ? false : true,
      legend: legend?.show !== false,
      legendType: legend?.type,
      colorRange: colorRange || ['#e6f7ff', '#40a9ff'],
      isColorRange: isColorRange,
      legendPosition: legend?.legendPosition || ELegendPosition.BOTTOM,
      autoFontSize: auto_size,
      customFontSize: custom_font_size,
      symbol: symbol,
      brush: !!brush,
      menu: menu || [],
      tooltip: tooltip,
      yAxisMin: yAxis?.min,
      yAxisMax: yAxis?.max,
      rightYAxis: !!rightYAxis,
      right_y_axis_name: rightYAxis?.name,
      rightYAxisMin: rightYAxis?.min,
      rightYAxisMax: rightYAxis?.max,
      rightMetric: rightYAxis?.metrics,
      rightYAxisFormat: rightYAxis?.format,
    });
  };

  // 命令式的给`ref.current`赋值个对象
  useImperativeHandle(ref, () => ({
    submit: async () => {
      return await new Promise((resolve, reject) => {
        form
          .validateFields()
          .then((values: any) => {
            let option = {};
            const {
              grid_x,
              grid_y,
              grid_x2,
              grid_y2,
              smooth,
              dataZoom,
              isStack,
              isArea,
              legend,
              legendType,
              colorRange,
              color,
              isColorRange,
              legendPosition,
              autoFontSize,
              customFontSize,
              symbol,
              symbol_size,
              brush,
              menu,
              x_axis_label_rotate,
              tooltip,
              y_axis_name,
              yAxisMin,
              yAxisMax,
              rightYAxis,
              right_y_axis_name,
              rightYAxisMin,
              rightYAxisMax,
              rightMetric,
              rightYAxisFormat,
            } = values;
            resolve({
              ...option,
              grid: {
                left: `${grid_x}px`,
                top: `${grid_y}px`,
                right: `${grid_x2}px`,
                bottom: `${grid_y2}px`,
              },
              legend: legend
                ? {
                    type: legendType,
                    legendPosition,
                    //@ts-ignore
                    ...(LegendPosDict[legendPosition] || {}),
                    textStyle: {
                      fontSize: !autoFontSize && customFontSize,
                    },
                  }
                : {
                    show: false,
                  },
              color: color ? JSON.parse(color) || [] : undefined,
              isColorRange,
              colorRange,
              custom_font_size: customFontSize,
              yAxis: {
                name: y_axis_name,
                min: yAxisMin,
                max: yAxisMax,
                nameTextStyle: {
                  color: 'black',
                },
              },
              ...(() => {
                if (rightYAxis) {
                  return {
                    rightYAxis: {
                      name: right_y_axis_name,
                      min: rightYAxisMin,
                      max: rightYAxisMax,
                      nameTextStyle: {
                        color: 'black',
                      },
                      metrics: rightMetric,
                      format: rightYAxisFormat,
                    },
                  };
                }
                return {};
              })(),
              xAxis: {
                axisLabel: {
                  interval: 0,
                  rotate: x_axis_label_rotate,
                  fontSize: customFontSize,
                },
              },
              is_area: isArea,
              symbol,
              symbolSize: symbol ? symbol_size : undefined,
              is_smooth: smooth,
              dataZoom: dataZoom
                ? {
                    type: 'inside',
                    realtime: true,
                  }
                : false,
              is_stack: isStack,
              tooltip: tooltip
                ? {
                    trigger: 'axis',
                  }
                : {
                    trigger: 'false',
                  },
              ...(() => {
                if (brush) {
                  return {
                    brush: {
                      toolbox: ['lineX'],
                      xAxisIndex: 0,
                    },
                  };
                }
              })(),
              menu: menu,
            });
          })
          .catch(() => {
            reject({});
          });
        return;
      });
    },
  }));

  useEffect(() => {
    init();
  }, []);

  return (
    <>
      <PositionPanel />
      <Divider orientation="left">展示</Divider>
      <FormItem name={'smooth'} valuePropName="checked" initialValue={false}>
        <Checkbox>曲线平滑</Checkbox>
      </FormItem>
      <FormItem name={'dataZoom'} valuePropName="checked" initialValue={false}>
        <Checkbox>鼠标滚动缩放</Checkbox>
      </FormItem>
      <FormItem name="isStack" valuePropName="checked" initialValue={true}>
        <Checkbox>堆叠</Checkbox>
      </FormItem>
      <FormItem name="isArea" valuePropName="checked" initialValue={true}>
        <Checkbox>填充颜色</Checkbox>
      </FormItem>

      <FormItem name="legend" valuePropName="checked" initialValue={true}>
        <Checkbox>图例</Checkbox>
      </FormItem>
      <FormItem
        noStyle
        shouldUpdate={(prevValues, currentValues) => prevValues.legend !== currentValues.legend}
      >
        {({ getFieldValue, setFieldValue }) => {
          if (getFieldValue('legend')) {
            return (
              <Card size="small" title="图例配置" style={{ marginBottom: '20px' }}>
                <FormItem name="legendType" initialValue={'scroll'}>
                  <Switch
                    checkedChildren="平铺"
                    unCheckedChildren="滚动"
                    checked={getFieldValue('legendType') === 'plain'}
                    onChange={(e) => {
                      setFieldValue('legendType', e ? 'plain' : 'scroll');
                    }}
                  ></Switch>
                </FormItem>
                <div>
                  <LegendPosSelector />
                </div>
              </Card>
            );
          }
        }}
      </FormItem>
      <CustomFont />
      <FormItem name="symbol" valuePropName="checked">
        <Checkbox>标记点</Checkbox>
      </FormItem>
      <FormItem
        noStyle
        shouldUpdate={(prevValues, currentValues) => prevValues.symbol !== currentValues.symbol}
      >
        {({ getFieldValue }) => {
          if (getFieldValue('symbol')) {
            return (
              <FormItem name="symbol_size" label="标记点大小">
                <Slider max={20} defaultValue={8} />
              </FormItem>
            );
          }
        }}
      </FormItem>
      <FormItem name="brush" valuePropName="checked">
        <Checkbox>框选菜单</Checkbox>
      </FormItem>
      <FormItem
        noStyle
        shouldUpdate={(prevValues, currentValues) => prevValues.brush !== currentValues.brush}
      >
        {({ getFieldValue, setFieldValue }) => {
          const brush = getFieldValue('brush');
          if (brush) {
            return (
              <Card size="small" title="配置框选菜单">
                <FormItem
                  noStyle
                  shouldUpdate={(prevValues, currentValues) =>
                    prevValues.menu !== currentValues.menu
                  }
                >
                  {() => {
                    const menu = (getFieldValue('menu') as any[]) || [];
                    return (
                      <>
                        <FormItem name="menu" noStyle initialValue={[]} />
                        {menu.map((item) => {
                          return (
                            <Card
                              title="配置菜单项"
                              size={'small'}
                              style={{ margin: '5px' }}
                              extra={
                                <CloseSquareOutlined
                                  style={{ color: 'red' }}
                                  onClick={() => {
                                    dropMenu(item.id, menu, (menu: any) => {
                                      setFieldValue('menu', menu);
                                    });
                                  }}
                                />
                              }
                            >
                              <FormItem label="菜单类型">
                                <Select
                                  style={{ width: '100%' }}
                                  placeholder="请选择菜单类型"
                                  value={item.type}
                                  onChange={(type) => {
                                    AddMenu(
                                      {
                                        ...item,
                                        type,
                                      },
                                      false,
                                      menu,
                                      (menu: any) => {
                                        setFieldValue('menu', menu);
                                      },
                                    );
                                  }}
                                >
                                  {brushMenuType.map((key: string) => {
                                    return (
                                      <Select.Option value={key}>
                                        {(EBrushMenuName as any)[key]}
                                      </Select.Option>
                                    );
                                  })}
                                </Select>
                              </FormItem>
                              <FormItem label="菜单名称">
                                <Input
                                  style={{ width: '100%' }}
                                  placeholder="请输入菜单名称"
                                  value={item.name}
                                  onChange={(e) => {
                                    AddMenu(
                                      { ...item, name: e.target.value },
                                      false,
                                      menu,
                                      (menu: any) => {
                                        setFieldValue('menu', menu);
                                      },
                                    );
                                  }}
                                ></Input>
                              </FormItem>
                              {item.type === 'jump_to_page' ? (
                                <FormItem label="跳转地址">
                                  <Input
                                    style={{ width: '100%' }}
                                    placeholder="请输入URL"
                                    value={item.data}
                                    onChange={(e) => {
                                      AddMenu(
                                        { ...item, data: e.target.value },
                                        false,
                                        menu,
                                        (menu: any) => {
                                          setFieldValue('menu', menu);
                                        },
                                      );
                                    }}
                                  ></Input>
                                </FormItem>
                              ) : (
                                ''
                              )}
                            </Card>
                          );
                        })}
                        <Button
                          type={'dashed'}
                          style={{ width: '100%' }}
                          icon={<PlusSquareOutlined />}
                          onClick={() => {
                            AddMenu(
                              {
                                id: uuidv4(),
                                name: '修改时间',
                                data: '',
                                type: 'change_time',
                              },
                              true,
                              menu,
                              (menu: any) => {
                                setFieldValue('menu', menu);
                              },
                            );
                          }}
                        >
                          添加菜单项
                        </Button>
                      </>
                    );
                  }}
                </FormItem>
              </Card>
            );
          }
        }}
      </FormItem>
      <SchemeColor />
      <Divider orientation="left">X轴</Divider>
      <FormItem name="x_axis_label_rotate" label="X轴Label旋转">
        <Select defaultValue={0}>
          <Select.Option key={0} value={0}>
            0°
          </Select.Option>
          <Select.Option key={45} value={45}>
            45°
          </Select.Option>
        </Select>
      </FormItem>
      <FormItem name="tooltip" valuePropName="checked" initialValue={true}>
        <Checkbox>数值提示</Checkbox>
      </FormItem>
      <Divider orientation="left">Y轴</Divider>
      <FormItem name="y_axis_name" label="Y轴标题">
        <Input></Input>
      </FormItem>
      <FormItem label="Y轴范围">
        <FormItem noStyle name="yAxisMin">
          <InputNumber
            placeholder="MIN"
            min={0}
            style={{ width: '48%', marginRight: '14px' }}
          ></InputNumber>
        </FormItem>
        <FormItem noStyle name="yAxisMax">
          <InputNumber placeholder="MAX" min={0} style={{ width: '48%' }}></InputNumber>
        </FormItem>
      </FormItem>
      <FormItem name="rightYAxis" valuePropName="checked">
        <Checkbox>右侧Y轴</Checkbox>
      </FormItem>
      <FormItem
        noStyle
        shouldUpdate={(prevValues, currentValues) =>
          prevValues.rightYAxis !== currentValues.rightYAxis
        }
      >
        {({ getFieldValue }) => {
          const rightYAxis = getFieldValue('rightYAxis');
          if (rightYAxis) {
            return (
              <Card title="右侧Y轴" size="small" style={{ marginBottom: '20px' }}>
                <FormItem name="right_y_axis_name" label="标题">
                  <Input></Input>
                </FormItem>
                <FormItem label="范围">
                  <FormItem name="rightYAxisMin">
                    <InputNumber placeholder="MIN" min={0} style={{ width: '100%' }}></InputNumber>
                  </FormItem>
                  <FormItem name="rightYAxisMax">
                    <InputNumber placeholder="MAX" min={0} style={{ width: '100%' }}></InputNumber>
                  </FormItem>
                </FormItem>
                <FormItem label="度量" name="rightMetric">
                  <Select
                    placeholder="请选择右侧Y轴对应字段"
                    style={{ width: '100%' }}
                    mode="multiple"
                  >
                    {metrics.map((m) => {
                      return (
                        <Select.Option value={m.id} key={m.id}>
                          {formatMetric(m)}
                        </Select.Option>
                      );
                    })}
                  </Select>
                </FormItem>
                <FormItem label="格式化" name="rightYAxisFormat" initialValue={EFormatterType.Raw}>
                  <Select placeholder="请选择右侧Y轴格式化" style={{ width: '100%' }}>
                    {AXIS_FORMATTER_TYPE_LIST.map((type) => {
                      return (
                        <Select.Option value={type.value} key={type.value}>
                          {type.label}
                        </Select.Option>
                      );
                    })}
                  </Select>
                </FormItem>
              </Card>
            );
          }
        }}
      </FormItem>
    </>
  );
}

export default React.forwardRef(TimeSeriesConfig);
