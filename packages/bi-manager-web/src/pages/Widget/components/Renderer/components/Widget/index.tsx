import EchartsCore from '@/components/EchartsCore';
import {
  ECOption,
  EVisualizationType,
  ITableProps,
  IWidgetFormData,
  IWidgetSpecification,
  parseObjJson,
  transformEChartsOptions,
  SHARE_PAGE_PREFIX,
  ChartProperties,
  INpmdDict,
  formatValue,
  ITimeRange,
  mappingDict,
} from '@bi/common';
import { Menu } from 'antd';
import { BarSeriesOption, PieSeriesOption } from 'echarts';
import { useMemo, useState } from 'react';
import { useLocation } from 'umi';
import BigNumberRender, { BigNumberValueType } from '../BigNumberRender';
import moment from 'moment';
import { IMenuType } from '../../../ConfigPanel/components/ConfigDisplay';
import { getColorList, getNextColor } from '@bi/common';
import { sendMsgToParent } from '@/utils/sendMsgToParent';
import EnhancedTableRender from '../EnhancedTableRender';
import { IReferenceResult } from '@bi/common';
import { deepMerge } from '@/utils/merge';
import { uniqueObjToKeyCreator } from '@/utils/decoder';

const uniqueObjToKey = uniqueObjToKeyCreator();
export interface IWidgetProps {
  widget: IWidgetFormData;
  colNames: string[];
  colIdList: string[];
  references?: IReferenceResult[];
  queriesData: any;
  /** 是否显示图表标题 */
  showName?: boolean;
  /** widget样式 */
  widgetStyle?: ChartProperties;
  /** 字典 */
  dicts: INpmdDict[];
  onBrushEnd?: (startTime: number, endTime: number) => void;
  brushMenuChildren?: JSX.Element;
  /** 覆盖时间 */
  time_range: ITimeRange;
  time_grain: '1m' | '5m' | '1h' | undefined;
}
export default function Widget({
  dicts,
  widgetStyle,
  widget,
  colNames,
  queriesData,
  colIdList,
  references = [],
  showName,
  time_range,
  time_grain,
}: IWidgetProps) {
  const location = useLocation();
  /** brushTime */
  const [brushFrom, setBrushFrom] = useState<string>('');
  const [brushTo, setBrushTo] = useState<string>('');

  let chart_properties =
    (widgetStyle
      ? { ...widgetStyle }
      : parseObjJson<IWidgetSpecification>(widget.specification).chart_properties) || {};

  const handleChangeTime = () => {
    if (brushFrom && brushTo) {
      sendMsgToParent({ from: brushFrom, to: brushTo });
    }
  };

  /** 处理brush */
  const handleBrushEnd = (startTime: number, endTime: number) => {
    if (startTime && endTime) {
      setBrushFrom(moment(startTime).format());
      setBrushTo(moment(endTime).format());
    }
  };

  const { brush, menu }: { menu: IMenuType[]; brush: boolean } = (chart_properties as any) || {};
  const handleMenuClick = (params: any) => {
    const { key } = params;
    const menuItem = menu.find((m) => m.id === key);
    if (menuItem) {
      switch (menuItem.type) {
        case 'change_time':
          handleChangeTime();
          break;
        case 'jump_to_page':
          window.open(menuItem.data);
          break;
      }
    }
  };

  // 内嵌页面，为了生成 pdf 使用
  const isSharePage = useMemo(() => {
    return location.pathname.includes(`${SHARE_PAGE_PREFIX}/`);
  }, [location.pathname]);

  const { viz_type } = widget;

  let transformedData = transformEChartsOptions({
    widget,
    colNames,
    colIdList,
    references,
    queriesData: mappingDict(widget, queriesData, dicts),
    time_range,
    time_grain,
  });

  switch (viz_type) {
    case EVisualizationType.BigNumberTotal:
      return (
        <BigNumberRender
          title={widget?.name}
          value={transformedData as BigNumberValueType}
          chartProperties={chart_properties}
        />
      );
    case EVisualizationType.Table:
      // const { metrics, groupby, columns } = parseObjJson<IWidgetSpecification>(widget.specification);
      let tableProps = {
        ...(transformedData as ITableProps),
        ...chart_properties,
      };

      const columns = tableProps?.columns?.map((c) => {
        return {
          ...c,
          cellStyle: {
            padding: `0px ${
              chart_properties?.column_padding !== undefined ? chart_properties?.column_padding : 10
            }px`,
            cursor: 'pointer',
            fontSize: chart_properties?.custom_font_size,
          },
          headerComponentParams: {
            template: `<div style="font-size:${chart_properties?.custom_font_size}px">${
              (c as any)?.headerName
            }</div>`,
          },
        };
      });
      return (
        <div
          style={{
            margin: '10px',
            overflowY: 'auto',
            overflowX: 'auto',
            height: '100%',
            width: '100%',
          }}
        >
          <EnhancedTableRender
            id={widget?.id || ''}
            data={tableProps?.dataSource}
            columns={columns}
            tableColumns={tableProps?.tableColumns || []}
            pagination={tableProps?.pagination as any}
            autoResize={tableProps?.auto_resize}
          />
        </div>
      );
    case EVisualizationType.TimeHistogram:
      return (() => {
        if (!showName) {
          (transformedData as ECOption).title = undefined;
        }

        if (isSharePage) {
          (transformedData as ECOption).brush = undefined;
          (transformedData as ECOption).toolbox = undefined;
          (transformedData as ECOption).grid = {
            ...((transformedData as ECOption).grid || {}),
            top: 10,
          };
          // 移除动画效果
          (transformedData as ECOption).animation = false;
        }
        const { y_axis_format } = parseObjJson<IWidgetSpecification>(widget.specification);
        const { auto_size, custom_font_size } = chart_properties as any;
        //@ts-ignore
        const dataLen = (transformedData as ECOption)?.series.length || 1;
        let colorList: string[] = (chart_properties?.color as any[]) || [];
        if (chart_properties?.isColorRange && chart_properties?.colorRange) {
          colorList = getColorList(chart_properties?.colorRange, dataLen, true);
        }
        const nextColor = getNextColor(colorList);
        const { rightYAxis } = chart_properties;
        const { metricNameMap } = transformedData as any;

        const widgetOption = deepMerge(
          transformedData as ECOption,
          chart_properties,
          {
            tooltip: (() => {
              if ((chart_properties?.tooltip as any)?.trigger !== 'false') {
                return {
                  formatter: function (params: any) {
                    var relVal = params[0].axisValueLabel;
                    for (var i = 0, l = params.length; i < l; i++) {
                      relVal +=
                        '<br/><span style="display:inline-block;margin-right:5px;border-radius:10px;width:9px;height:9px;background-color:' +
                        params[i].color +
                        '"></span>';
                      relVal += params[i].seriesName + ' : ';
                      const value = y_axis_format
                        ? params[i].value[1] === '0'
                          ? 0
                          : formatValue(parseFloat(params[i].value[1]), y_axis_format)
                        : (params[i].value[1] as string) || 0;
                      relVal += value;
                    }
                    return relVal;
                  },
                };
              }
            })(),
          },
          {
            /** 处理y轴 */
            yAxis: (() => {
              if (rightYAxis) {
                const yAxisList = [
                  {
                    ...(transformedData as ECOption).yAxis,
                    ...chart_properties?.yAxis,
                    position: 'left',
                    type: 'value',
                  },
                  {
                    type: 'value',
                    position: 'right',
                    ...rightYAxis,
                    axisLabel: {
                      formatter: (value: number) => {
                        return formatValue(value, rightYAxis?.format) as string;
                      },
                    },
                  },
                ];
                return yAxisList;
              } else {
                return {
                  axisLabel: {
                    ...((transformedData as ECOption).yAxis as any)?.axisLabel,
                    ...(chart_properties?.yAxis as any)?.axisLabel,
                    ...(() => {
                      if (!auto_size) {
                        return {
                          fontSize: custom_font_size,
                        };
                      }
                      return {};
                    })(),
                  },
                };
              }
            })(),

            /** 处理x轴 */
            xAxis: {
              axisLabel: {
                ...((transformedData as ECOption).xAxis as any)?.axisLabel,
                ...(chart_properties.xAxis as any)?.axisLabel,
                showMinLabel: false,
                showMaxLabel: false,
                // @ts-ignore
                hideOverlap: true,
                formatter: (value: string | number) => {
                  const time = moment(value).format('HH:mm');
                  if (time === '00:00') {
                    return moment(value).format('MM-DD');
                  }
                  if (moment(value).format('ss') === '00') {
                    return moment(value).format('HH:mm');
                  }
                  return time;
                },
              },
            },
          },
          {
            color: colorList,
          },
          {
            /** 处理series */
            series: ((transformedData as ECOption).series as any[])?.map((s) => {
              const rightSeries = !!rightYAxis?.metrics?.find((m: string) => s?.name?.includes(m));
              return {
                ...s,
                name: metricNameMap[s?.name] || s?.name,
                yAxisIndex: rightSeries ? '1' : '0',
                smooth: chart_properties?.is_smooth,
                stack: chart_properties?.is_stack && !rightSeries ? 'Total' : undefined,
                areaStyle: chart_properties?.is_area ? {} : undefined,
                showSymbol: chart_properties?.symbol,
                symbol: 'circle', //设定为实心点
                symbolSize: chart_properties?.symbolSize, //设定实心点的大小
                ...(() => {
                  if (chart_properties?.isColorRange) {
                    return {
                      color: nextColor(),
                    };
                  }
                  return {};
                })(),
              };
            }),
          },
        );
        // console.log(widgetOption);
        return (
          <EchartsCore
            key={uniqueObjToKey(widgetOption)}
            option={widgetOption}
            brush={brush}
            onBrushEnd={brush ? handleBrushEnd : undefined}
            brushMenuChildren={
              brush ? (
                <>
                  <Menu onClick={handleMenuClick}>
                    {menu?.map((item: IMenuType) => {
                      return <Menu.Item key={item.id}>{item.name}</Menu.Item>;
                    })}
                  </Menu>
                </>
              ) : undefined
            }
          />
        );
      })();
    case EVisualizationType.Pie:
      return (() => {
        if (!showName) {
          (transformedData as ECOption).title = undefined;
        }

        if (isSharePage) {
          (transformedData as ECOption).brush = undefined;
          (transformedData as ECOption).toolbox = undefined;
          (transformedData as ECOption).grid = {
            ...((transformedData as ECOption).grid || {}),
            top: 10,
          };
          // 移除动画效果
          (transformedData as ECOption).animation = false;
        }
        const widgetOption = deepMerge(
          transformedData as ECOption,
          chart_properties,
          (() => {
            /** 处理阀值 */
            const { threshold } = chart_properties;
            if (threshold !== undefined) {
              const { data }: { data: { name: string; value: number }[] } = (
                transformedData as ECOption
              )?.series as any;
              const totalValues = data.reduce((pre, cur) => pre + cur.value, 0);
              return {
                series: {
                  data: data.filter((item) => 100 * (item.value / totalValues) >= threshold),
                },
              };
            }
            return {};
          })(),
          {
            series: {
              itemStyle: {
                normal: {
                  label: {
                    ...(() => {
                      const { auto_size, custom_font_size } = chart_properties as any;
                      if (!auto_size) {
                        return {
                          fontSize: custom_font_size,
                        };
                      }
                      return {};
                    })(),
                  },
                },
              } as any,
            },
          },
          (() => {
            /** 处理颜色 */
            if (chart_properties?.isColorRange) {
              let l = ((transformedData as ECOption).series as PieSeriesOption)?.data?.length || 1;
              if (chart_properties?.isColorRange && chart_properties?.colorRange) {
                return { color: getColorList(chart_properties?.colorRange, l, true) };
              }
            }
            return {};
          })(),
          (() => {
            /** 处理topfilter */
            const topFilter = chart_properties?.top_filter as number;
            if (topFilter >= 0) {
              let seriesDataList = ((transformedData as ECOption)?.series as any)?.data || [];
              for (let i = 0; i < seriesDataList?.length; i++) {
                seriesDataList[i] = {
                  ...seriesDataList[i],
                  index: i,
                };
              }
              const sortedList = [...seriesDataList].sort((a, b) => b.value - a.value);
              const ignoredList: { value: number; name: string; index: number }[] =
                sortedList.slice(topFilter);
              const mergedItem = { value: 0, name: '其他' };
              for (let i = 0; i < ignoredList.length; i++) {
                const { index, value } = ignoredList[i];
                seriesDataList.splice(index, 1, undefined);
                mergedItem.value += value;
              }
              if (mergedItem?.value > 0) {
                return {
                  series: {
                    data: seriesDataList.filter((f: any) => f).concat(mergedItem),
                  },
                };
              } else {
                return {
                  series: {
                    data: seriesDataList.filter((f: any) => f),
                  },
                };
              }
            }
            return {};
          })(),
        );
        // console.log(widgetOption);
        return <EchartsCore key={uniqueObjToKey(widgetOption)} option={widgetOption} />;
      })();
    case EVisualizationType.Time_Column:
    case EVisualizationType.Column:
    case EVisualizationType.Bar:
      return (() => {
        if (!showName) {
          (transformedData as ECOption).title = undefined;
        }

        if (isSharePage) {
          (transformedData as ECOption).brush = undefined;
          (transformedData as ECOption).toolbox = undefined;
          (transformedData as ECOption).grid = {
            ...((transformedData as ECOption).grid || {}),
            top: 10,
          };
          // 移除动画效果
          (transformedData as ECOption).animation = false;
        }

        const { y_axis_format, metrics } = parseObjJson<IWidgetSpecification>(widget.specification);
        const { auto_size, custom_font_size } = chart_properties as any;
        const widgetOption = deepMerge(
          transformedData as ECOption,
          chart_properties,
          {
            series: ((transformedData as ECOption).series as BarSeriesOption[]).map((item) => ({
              ...item,
              label: {
                show: chart_properties?.show_bar_value,
                position: viz_type === EVisualizationType.Column ? 'top' : '',
                formatter: ({ value }: { value: number }) => {
                  return formatValue(value, y_axis_format) as string;
                },
                ...(() => {
                  if (!auto_size) {
                    return {
                      fontSize: custom_font_size,
                    };
                  }
                  return {};
                })(),
              } as any,
              z: 0,
              stack: chart_properties?.is_stack ? 'total' : undefined,
            })),
          },
          {
            yAxis: {
              axisLabel: {
                ...(() => {
                  if (!auto_size) {
                    return {
                      fontSize: custom_font_size,
                    };
                  }
                  return {};
                })(),
                color: '#999999',
              },
            },
            xAxis: {
              axisLabel: {
                ...(() => {
                  if (!auto_size) {
                    return {
                      fontSize: custom_font_size,
                    };
                  }
                  return {};
                })(),
                color: '#999999',
              },
            },
          },
        );

        //@ts-ignore
        const dataLen = (widgetOption as ECOption)?.series[0].data?.length || 1;
        if (metrics.length === 1) {
          /** 上色 */
          let colorList: string[] = chart_properties?.color as any[];
          if (chart_properties?.isColorRange && chart_properties?.colorRange) {
            colorList = getColorList(chart_properties?.colorRange, dataLen, true);
          }
          const nextColor = getNextColor(colorList);
          for (let i = dataLen >= 1 ? dataLen - 1 : 0; i >= 0; i--) {
            (((widgetOption as ECOption).series as BarSeriesOption[])[0] as any).data[i] = {
              //@ts-ignore
              value: widgetOption.series[0].data[i],
              itemStyle: {
                color: nextColor(),
              },
            };
          }
        } else {
          const dataLen = metrics.length || 1;
          if (chart_properties?.isColorRange && chart_properties?.colorRange) {
            (widgetOption as ECOption).color = getColorList(
              chart_properties?.colorRange,
              dataLen,
              true,
            );
          }
        }
        // console.log(widgetOption);
        return <EchartsCore key={uniqueObjToKey(widgetOption)} option={widgetOption} />;
      })();
    default:
      return <>为匹配到图表类型</>;
  }
}
