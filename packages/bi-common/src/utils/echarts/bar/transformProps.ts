import { XAXisOption, YAXisOption } from 'echarts/types/dist/shared';
import moment from 'moment';
import { getMetricFullName, ITransformEChartOptionsParams } from '..';
import { formatValue, parseObjJson } from '../..';
import { ECOption, IWidgetSpecification } from '../../../typings';
import { tooltipConfig } from '../dict';
import { transformEChartsClassifier } from '../index';

export default function transformProps(
  params: ITransformEChartOptionsParams,
  type: 'bar' | 'column',
) {
  const { height, width, widget, queriesData } = params;
  /** 获得groupby */
  const { groupby, y_axis_format, metrics, time_field } =
    parseObjJson<IWidgetSpecification>(widget.specification);
  /** 获取metric相关信息 */
  const metricsList = metrics.map((metric) => ({
    name: getMetricFullName(metric),
    display_name: metric.display_name,
  }));
  /** 对分组好的数据根据metric进行分类 */
  const classifyGroupedData = (groupedData: any) => {
    let isTimeGroup = false;
    if (
      groupby.length === 1 &&
      time_field !== undefined &&
      time_field! === groupby[0].field
    ) {
      isTimeGroup = true;
    }
    const groupDataWithKey: any[] = [];
    for (let key of Object.keys(groupedData)) {
      groupDataWithKey.push({
        key,
        index: groupedData[key][0]['index'],
        value: groupedData[key],
      });
    }

    groupDataWithKey.sort((a, b) => a?.index - b?.index);
    const sortedData = groupDataWithKey.reduce((pre, cur) => {
      return {
        ...pre,
        [cur.key]: cur.value,
      };
    }, {});

    const result: any[] = [];
    const groupNameSet = new Set<string>();
    if (metricsList?.length === 1) {
      const metric = metricsList[0];
      let list = [] as any[];
      const metricDataList: number[] = [];
      Object.keys(sortedData).forEach((key: string) => {
        const d = sortedData[key][0];
        list.push({
          ...d,
          key,
        });
      });
      list.sort((a, b) => a?.index - b?.index);
      list.forEach((item) => {
        groupNameSet.add(`${item?.key}`);
        metricDataList.push(item[metric?.name]);
      });
      result.push({
        name: `${metric?.display_name || metric?.name}`,
        type: 'bar',
        data: type !== 'column' ? metricDataList?.reverse() : metricDataList,
        emphasis: {
          disabled: true,
          focus: 'none',
        },
      });
    } else {
      metricsList.forEach((metric) => {
        const metricDataList: number[] = [];
        Object.keys(sortedData).forEach((key: string) => {
          const group: any[] = sortedData[key];
          let metricData = 0;
          group.forEach((item: any) => {
            groupNameSet.add(`${key}`);
            const value = item[metric.name];
            metricData += parseFloat(value);
          });
          metricDataList.push(metricData);
        });
        // metricDataList.sort((a, b) => a - b);
        result.push({
          name: `${metric?.display_name || metric?.name}`,
          type: 'bar',
          data: type !== 'column' ? metricDataList?.reverse() : metricDataList,
          emphasis: {
            disabled: true,
            focus: 'none',
          },
        });
      });
    }
    const groupName = isTimeGroup
      ? Array.from(groupNameSet).sort(
          (a, b) => moment(a).valueOf() - moment(b).valueOf(),
        )
      : Array.from(groupNameSet);
    return {
      result: type !== 'column' ? result.reverse() : result,
      groupName,
    };
  };

  const { result, groupName } = transformEChartsClassifier(
    queriesData || [],
    groupby || [],
    classifyGroupedData,
  );
  const categoryAxis: XAXisOption | YAXisOption = {
    type: 'category',
    data: type !== 'column' ? groupName.reverse() : groupName,
    splitLine: {
      show: false,
    },
    axisLabel: {
      inside: type === 'bar',
      z: 10,
      color: '#999999',
    },
    ...(() => {
      if (
        groupby.length === 1 &&
        time_field !== undefined &&
        time_field! === groupby[0].field
      ) {
        return {
          axisLine: {
            show: false,
          },
          axisTick: {
            show: false,
            interval: 'auto',
          },
          axisLabel: {
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
            inside: type === 'bar',
            z: 10,
            color: '#999999',
          },
        };
      } else {
        return {};
      }
    })(),
  };

  const valueAxis: XAXisOption | YAXisOption = {
    type: 'value',
    show: false,
    boundaryGap: [0, 0.01],
    splitLine: {
      show: false,
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
      textStyle: {
        color: '#999999',
      },
    },
    grid: {
      left: 10,
      top: 10,
      right: 10,
      bottom: 30,
      containLabel: true,
    },
    ...(() => {
      if (type === 'bar') {
        return {
          labelLayout: {
            x: '100%',
            align: 'right',
            verticalAlign: 'middle',
            draggable: true,
          },
        };
      }
      return {};
    })(),
    xAxis: (type === 'column' ? categoryAxis : valueAxis) as XAXisOption,
    yAxis: (type === 'column' ? valueAxis : categoryAxis) as YAXisOption,
    series: result,
    animation: false,
  };

  return option;
}
