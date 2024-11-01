import { getMetricFullName, ITransformEChartOptionsParams } from '..';
import { formatValue, parseObjJson } from '../..';
import { IWidgetSpecification, ECOption } from '../../../typings';
import { tooltipConfig } from '../dict';
import { transformEChartsClassifier } from '../index';

export default function transformProps(params: ITransformEChartOptionsParams) {
  const { height, width, widget, queriesData } = params;
  /** 获得groupby */
  const { groupby, y_axis_format, metrics } =
    parseObjJson<IWidgetSpecification>(widget.specification);
  /** 获取metric相关信息 */
  const metricsList = metrics.map((metric) => ({
    name: getMetricFullName(metric),
    display_name: metric.display_name,
  }));
  /** 根据metirc对分组之后的数据进行分类 */
  const classifyGroupedData = (groupedData: any) => {

    let result: any = {};
    for (let key in groupedData) {
      const list: any[] = groupedData[key];
      list.forEach((item) => {
        metricsList.forEach((metric) => {
          const newName = `${key}${
            groupby.length !== 0
              ? metricsList.length > 1
                ? `${key ? '_' : ''}${metric?.display_name || metric?.name}`
                : ``
              : metric?.display_name || metric?.name
          }`;

          result[newName] = result[newName] || 0;
          result[newName] += parseFloat(item[metric.name]);
        });
      });
    }

    const nameFormatList: any[] = [];
    Object.keys(result).forEach((key) => {
      const data = result[key];
      // const formatData = y_axis_format
      //   ? formatValue(parseInt(data), y_axis_format)
      //   : parseInt(data);
      nameFormatList[`${key}`] = data;
    });
    result = nameFormatList;
    return Object.keys(result).map((key) => ({
      value: result[key],
      name: key,
    }));
  };

  const data = transformEChartsClassifier(
    queriesData || [],
    groupby || [],
    classifyGroupedData,
  );

  const option: ECOption = {
    height,
    width,
    color: [
      '#5B8FF9',
      '#5AD8A6',
      '#5D7092',
      '#F6BD16',
      '#E86452',
      '#6DC8EC',
      '#945FB9',
      '#FF9845',
      '#1E9493',
      '#FF99C3',
    ],
    tooltip: {
      ...tooltipConfig,
      trigger: 'item',
      formatter: (data) => {
        const valStr = formatValue(
          parseFloat(data.value),
          y_axis_format,
        ).toString();
        return `${data.name}: ${
          valStr.length > 64 ? valStr.substring(0, 64) + '...' : valStr
        } (${data.percent.toFixed(1)}%)`;
      },
    },
    xAxis: { show: false },
    yAxis: { show: false },
    legend: {
      orient: 'horizontal',
      type: 'scroll',
      // @ts-ignore
      y: 'bottom',
      textStyle: {
        color: '#999999',
      },
    },
    series: {
      type: 'pie',
      radius: '50%',
      data: data,
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)',
        },
      },
      itemStyle: {
        normal: {
          label: {
            show: true,
            formatter: '{b} ({d}%)',
          },
          labelLine: { show: true },
        },
      } as any,
    },
    animation: false,
  };
  return option;
}
