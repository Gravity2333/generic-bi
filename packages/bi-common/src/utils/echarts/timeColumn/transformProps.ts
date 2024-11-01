import { XAXisOption, YAXisOption } from 'echarts/types/dist/shared';
import moment from 'moment';
import { ITransformEChartOptionsParams, getMetricFullName } from '..';
import { formatValue, parseObjJson } from '../..';
import { ECOption, IWidgetSpecification } from '../../../typings';
import { tooltipConfig } from '../dict';

export default function transformProps(params: ITransformEChartOptionsParams) {
  const {
    height,
    width,
    widget,
    queriesData,
    colIdList = [],
    colNames = [],
  } = params;
  /** 获得groupby */
  const {  y_axis_format, metrics, time_field } =
    parseObjJson<IWidgetSpecification>(widget.specification);

  const timeList: string[] = [];
  const dataMap = new Map();
  for (const dataItem of queriesData) {
    const timeAlias = time_field?.toUpperCase() || '';
    for (let i = 0; i < metrics?.length; i++) {
      const metricItem = metrics[i];
      const { id } = metricItem;
      const index = colIdList?.findIndex((cid) => cid === id);
      if (index >= 0) {
        dataMap.set(id, [
          ...(dataMap.get(id) || []),
          parseFloat(dataItem[colNames[index]]),
        ]);
      }
    }
    timeList.push(dataItem[timeAlias]);
  }

  const categoryAxis: XAXisOption | YAXisOption = {
    type: 'category',
    data: timeList,
    show: true,
    splitLine: {
      show: true,
    },
    axisLabel: {
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
      interval: Math.floor(queriesData?.length/5),
      inside: false,
      //@ts-ignore
      z: 10,
      color: 'black',
    },
  };

  const valueAxis: XAXisOption | YAXisOption = {
    type: 'value',
    show: true,
    boundaryGap: [0, 0.01],
    splitLine: {
      show: true,
    },
    axisLabel: {
      formatter: (value: number) => {
        return formatValue(value, y_axis_format) as string;
      },
    },
  };

  const option: ECOption = {
    height,
    width,
    color: [
      '#1890FF',
      '#41D9C7',
      '#2FC25B',
      '#FACC14',
      '#D1E65C',
      '#84E777',
      '#F8965A',
      '#FF696A',
      '#5C8EE6',
      '#13C2C2',
      '#5CA3E6',
      '#7D7FDE',
      '#B381E6',
      '#F04864',
      '#D940E4',
    ],
    tooltip: {
      ...tooltipConfig,
      formatter: function (params: any) {
        const title = params[0].name;
        var relVal = title;
        for (var i = 0, l = params.length; i < l; i++) {
          if (params[i]?.name === title) {
            relVal +=
              '<br/><span style="display:inline-block;margin-right:5px;border-radius:10px;width:9px;height:9px;background-color:' +
              params[i].color +
              '"></span>';
            relVal += (params[i].seriesName +
              ' : ' +
              formatValue(params[i].value, y_axis_format)) as string;
          }
        }

        return relVal;
      },
    },
    legend: {
      orient: 'horizontal',
      type: 'scroll',
      bottom: 'bottom',
    },
    grid: {
      left: 10,
      top: 10,
      right: 10,
      bottom: 30,
      containLabel: true,
    },
    xAxis: categoryAxis as XAXisOption,
    yAxis: valueAxis as YAXisOption,
    series: (() => {
      const l: any[] = [];
      dataMap.forEach((v, k) => {
        const metricItem = metrics?.find(m=>m?.id === k)
        l.push({
          emphasis: { disabled: true, focus: 'none' },
          data: v,
          name: metricItem?.display_name || getMetricFullName(metricItem!),
          type: 'bar',
          stack: 'total',
        });
      });
      return l;
    })(),
    animation: false,
  };
  return option;
}
