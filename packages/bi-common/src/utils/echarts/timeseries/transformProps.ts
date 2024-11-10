import {
  getMetricFullName,
  ITransformEChartOptionsParams,
  transformEChartsClassifier,
} from '..';
import { formatValue, getTimeRange, parseObjJson } from '../..';
import { ESelectType, IWidgetSpecification } from '../../../typings';
import { tooltipConfig } from '../dict';
import { ECOption } from '../typings';
import { getMatchedInterval } from '../..';
import moment from 'moment';

const getIntervalFromRange = (time_grain: '1m' | '5m' | '1h' | undefined) => {
  if (time_grain === '1m') {
    return 60000;
  } else if (time_grain === '1h') {
    return 3600000;
  } else if (time_grain === '5m') {
    return 300000;
  }
  return 60000;
};

const getBorderTime = (
  startTime: string | number,
  endTime: string | number,
  interval: number,
) => {
  const start = moment(startTime);
  const end = moment(endTime);
  if (interval === 60000) {
    if (end.second() > 0) {
      return [
        start.set('s', 0).valueOf(),
        end.set('s', 0).valueOf(),
      ];
    }
    return [start.set('s', 0).valueOf(), end.set('s', 0).valueOf()];
  } else if (interval === 3600000) {
    if (end.minute() > 0) {
      return [
        start.set('s', 0).set('m', 0).valueOf(),
        end.set('s', 0).set('m', 0).valueOf(),
      ];
    }
    return [
      start.set('s', 0).set('m', 0).valueOf(),
      end.set('s', 0).set('m', 0).valueOf(),
    ];
  } else if (interval === 300000) {
    const startM = Math.floor(start.minute() / 5) * 5;
    const endM = Math.ceil(end.minute() / 5) * 5;
    return [
      start.set('m', startM).set('s', 0).valueOf(),
      end.set('m', endM).set('s', 0).valueOf(),
    ];
  }
  return [start.valueOf(), end.valueOf()];
};

export default function transformProps(params: ITransformEChartOptionsParams) {
  const { height, width, widget, queriesData, references = [] } = params;
  /** 获得groupby */
  const {
    groupby,
    y_axis_format,
    time_field,
    time_grain,
    time_range,
    metrics,
    sorts,
  } = parseObjJson<IWidgetSpecification>(widget.specification);

  const timeFieldAlias = time_field?.toUpperCase();

  const covered_time_grain = params?.time_grain || time_grain;
  const covered_time_range = params?.time_range || time_range;
  let [startTimeStamp, endTimeStamp] = getTimeRange(covered_time_range!);

  /** 时间间隔ms */
  let interval = getIntervalFromRange(
    covered_time_grain ||
      getMatchedInterval(
        moment(startTimeStamp).format(),
        moment(endTimeStamp).format(),
      ),
  );

  let [startTime, endTime] = getBorderTime(
    startTimeStamp,
    endTimeStamp,
    interval,
  );
  /** 获取metric相关信息 */
  const metricsList = metrics.map((metric) => {
    return {
      id: metric?.id,
      name: getMetricFullName(metric),
      display_name: metric.display_name,
      isBandwidth: metric.isBandwidth || false,
    };
  });

  /** 对groupby之后的数据根据metric再次进行分类，并且根据时间戳进行排序 */
  const handleGroupedData = (groupedData: any) => {
    const sortLegend = metrics?.length === 1 && sorts.length > 0;
    const sortIndex = sortLegend
      ? `${sorts[0][0]?.aggregate}(${sorts[0][0]?.field})`
      : ``;
    const legendCnt = {};
    let result: any = {};
    const metricNameMap = {};
    const metricIdMap = {};
    let max = 0;

    for (let key in groupedData) {
      const list: any[] = groupedData[key];
      list.forEach((item) => {
        if (sortLegend) {
          if (!legendCnt[key]) {
            legendCnt[key] = parseFloat(item[sortIndex] || '0');
          } else {
            legendCnt[key] += parseFloat(item[sortIndex] || '0');
          }
        }

        metricsList.forEach((metric) => {
          const time = item[timeFieldAlias!]||item[time_field!];
          const { isBandwidth, id } = metric;
          const value =
            isBandwidth && interval
              ? (item[metric.name]*8 / (interval / 1000)).toFixed(2)
              : item[metric.name];
          if (+value > max) {
            max = +value;
          }
          const newName = `${key}${
            metricsList.length > 1
              ? groupby.length === 0
                ? metric?.display_name || metric?.name
                : `_${metric?.display_name || metric?.name}`
              : groupby.length === 0
              ? metric?.display_name || metric?.name
              : ''
          }`;
          const mergedId = `${key}^${id}`;
          metricNameMap[mergedId] = newName;
         
          const timestamp = moment(moment(time).format('YYYY-MM-DD:HH:mm:00')).zone('+0800').valueOf();
          result[mergedId] = result[mergedId] || [];
          result[mergedId].push([timestamp, value]);
          result[mergedId].max = max;
          metricIdMap[metric.id] = result[mergedId];
        });
      });
    }

    /** 补点的情况 */
    for (let time = startTime; time < endTime; time += interval) {
      Object.keys(result).forEach((key) => {
        const currentMetric: [number, string][] = result[key];
        if (!result[key].find((data) => data[0] === time)) {
          currentMetric.push([time, '0']);
        }
      });
    }
    /** 排序 */
    for (let key in result) {
      const list: [number, number][] = result[key];
      result[key] = list.sort((a, b) => a[0] - b[0]);
    }

    if (sortLegend) {
      const sortedList = Object.keys(legendCnt);
      const sortDirction = sortLegend ? sorts[0][1] : '';
      sortedList.sort((a: string, b: string) => {
        if (sortDirction === 'asc') {
          return legendCnt[a] - legendCnt[b];
        } else {
          return legendCnt[b] - legendCnt[a];
        }
      });

      const sortedDataList: any[] = [];
      for (const k of sortedList) {
        Object.keys(result).forEach((resKey) => {
          if (resKey.split('^')[0] === k) {
            sortedDataList.push({
              name: k,
              type: 'line',
              smooth: false,
              symbol: 'none',
              areaStyle: {},
              data: result[resKey],
              metricNameMap,
            });
          }
        });
      }
      return [sortedDataList, metricNameMap, metricIdMap];
    }

    return [
      Object.keys(result).map((key) => ({
        name: key,
        type: 'line',
        smooth: false,
        symbol: 'none',
        areaStyle: {},
        data: result[key],
      })),
      metricNameMap,
      metricIdMap,
    ];
  };

  const [data, metricNameMap, metricIdMap] = transformEChartsClassifier(
    queriesData || [],
    groupby || [],
    handleGroupedData,
    timeFieldAlias,
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
    },
    toolbox: undefined,
    xAxis: {
      type: 'time',
      splitLine: {
        show: true,
        lineStyle: {
          color: '#EEEEEE',
        },
      },
      axisLine: {
        lineStyle: {
          color: '#EEEEEE',
        },
      },
      axisLabel: {
        textStyle: {
          color: '#7F7F7F',
        },
      } as any,
      boundaryGap: false,
    } as any,
    yAxis: {
      type: 'value',
      axisLine: {
        lineStyle: {
          color: '#7F7F7F',
        },
      },
      splitLine: {
        show: true,
        lineStyle: {
          color: '#EEEEEE',
        },
      },
      axisLabel: {
        show: true,
        formatter: (value: number) => {
          return formatValue(value, y_axis_format) as string;
        },
      },
    },
    grid: {
      top: 50,
      left: 50,
      bottom: 50,
      right: 50,
    },
    legend: {
      type: 'scroll',
      orient: 'horizontal',
      bottom: 'bottom',
    },
    // dataZoom: [
    //   {
    //     type: 'inside',
    //     start: 0,
    //     end: 20,
    //   },
    //   {
    //     start: 0,
    //     end: 20,
    //   },
    // ],
    animation: false,
    series: (() => {
      if (references?.length > 0) {
        const dataList = [...data];
        references?.forEach((r: any) => {
          if (r?.expression_type === ESelectType.PERCENTAGE) {
            const metricData = metricIdMap[r.metricId];
            const max = +metricData.max;
            const refLine = [] as [number, number][];
            for (let time = startTime; time < endTime; time += interval) {
              refLine.push([time, max * (r.percentage / 100)]);
            }
            dataList.push({
              name: r?.display_name || r?.name || r?.id,
              type: 'line',
              smooth: false,
              symbol: 'none',
              areaStyle: {},
              data: refLine,
              color: r?.color,
              stack: false,
            });
          } else {
            const refLine = [] as [number, number][];
            for (let time = startTime; time < endTime; time += interval) {
              refLine.push([time, r?.value]);
            }
            dataList.push({
              name: r?.name || r?.id,
              type: 'line',
              smooth: false,
              symbol: 'none',
              areaStyle: {},
              data: refLine,
              color: r?.color,
            });
          }
        });
        return dataList;
      }
      return data;
    })(),
    metricNameMap,
  };

  return option;
}
