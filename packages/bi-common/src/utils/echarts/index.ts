import {
  EVisualizationType,
  IMetric,
  IReferenceResult,
  ITimeRange,
  IWidgetFormData,
} from '../../typings';
import { default as pieTransformProps } from './pie/transformProps';
import { default as timeseriesTransformProps } from './timeseries/transformProps';
import { default as columnTransformProps } from './bar/transformProps';
import { default as timeColumnTransformProps } from './timeColumn/transformProps';
import { default as bigNumberTransformProps } from './bigNumber/transformProps';
import { default as tableTransformProps } from './table/transformProps';
import { IGroupBy } from '../../typings';
import { ECOption, ITableProps } from './typings';
import { addArrayJoin } from '..';

export * from './dict';

export interface ITransformEChartOptionsParams {
  theme?: 'light' | 'dark';
  /** 图表宽度 */
  width?: number;
  /** 图表高度 */
  height?: number;
  /** 图表配置 json */
  widget: IWidgetFormData;
  /** 根据图表配置 json 获取的字段名称 */
  colNames?: string[];
  /** 列id列表 */
  colIdList?: string[];
  /** 标志线 */
  references?: IReferenceResult[];
  /** 根据图表配置 json 查询到的原始数据结果 */
  queriesData: any;
  /** 覆盖时间 */
  time_range: ITimeRange;
  time_grain: '1m' | '5m' | '1h' | undefined;
}
/**
 * 生成 ECharts 绘图所需要的 Options
 * @param params
 * @returns
 */
export function transformEChartsOptions(
  params: ITransformEChartOptionsParams,
): ECOption | ITableProps | string | undefined {
  const specification = JSON.parse(params.widget.specification);
  /** 获取widget类型 */
  const { viz_type } = specification;
  /** 根据类型分派处理 */
  if (viz_type === EVisualizationType.Pie) {
    return pieTransformProps(params);
  }
  if (viz_type === EVisualizationType.TimeHistogram) {
    return timeseriesTransformProps(params);
  }
  if (viz_type === EVisualizationType.Column) {
    return columnTransformProps(params, 'column');
  }
  if (viz_type === EVisualizationType.Bar) {
    return columnTransformProps(params, 'bar');
  }
  if (viz_type === EVisualizationType.Time_Column) {
    return timeColumnTransformProps(params);
  }
  if (viz_type === EVisualizationType.BigNumberTotal) {
    return bigNumberTransformProps(params) as string;
  }
  if (viz_type === EVisualizationType.Table) {
    return tableTransformProps(params) as ITableProps;
  }
}

/**
 * 生成 ECharts 的数据集（ dataset ）
 * @see https://echarts.apache.org/handbook/zh/concepts/dataset
 * @see https://echarts.apache.org/zh/option.html#dataset
 */
export function transformEChartsDataset(
  params: ITransformEChartOptionsParams,
) {}

/**
 * 生成 ECharts 的数据集（ dataset ）
 * @see https://echarts.apache.org/zh/option.html#series
 */
export function transformEChartsSeries(params: ITransformEChartOptionsParams) {}

export function extractAliasFromSQL(sql: string) {
  const regex = /AS\s+([^\s]+)/gi;
  let matches: any[] = [];
  let match;
  while ((match = regex.exec(sql))) {
    matches.push(match[1]);
  }
  return matches;
}

/**
 * 对数组根据group分类
 */
export function transformEChartsClassifier(
  queriesData: any[],
  group: IGroupBy[],
  callback?: (result: any) => any,
  except?: string,
) {
  if (!queriesData || !group) {
    return;
  }
  let result: any = {
    '': queriesData.map((data, index) => ({
      ...data,
      index,
    })),
  };
  for (let groupItem of group) {
    if (except && groupItem.field === except) {
      continue;
    }
    const tempData: any = {};

    Object.keys(result).forEach((key) => {
      const subGroup: any[] = result[key];
      subGroup.forEach((dataRow) => {
        const value =
          dataRow[
            (() => {
              if (/^Array((.*))$/.test(groupItem.type || '')) {
                return addArrayJoin(groupItem?.field, groupItem?.arrayJoin);
              } else {
                return (
                  extractAliasFromSQL(groupItem?.field)[0] || groupItem?.field
                );
              }
            })()
          ];
        const newGroupKey =
          (key === ''
            ? value
              ? key.concat(`${value}`)
              : ''
            : key.concat(` ${groupItem?.connect_symbol || ' '} ${value}`)) ||
          '';

        tempData[newGroupKey] = tempData[newGroupKey] || [];
        tempData[newGroupKey].push(dataRow);
      });
    });
    result = tempData;
  }
  return callback ? callback(result) : result;
}

/** 将聚合函数和字段值拼接成一个fullname */
export function getMetricFullName(metric: IMetric) {
  if (metric.expression_type === 'sql') {
    return metric.sql_expression!;
  } else {
    if (metric.aggregate === 'COUNT_DISTINCT') {
      return `count(DISTINCT ${metric.field})`;
    }
    return `${metric.aggregate}(${metric.field})`;
  }
}

/** 处理toolTips位置 */
export function getToolTipPos(point, params, dom, rect, size) {
  /** 定义tooltip位置 */
  let x = 0;
  let y = 0;

  /** 获取鼠标位置 */
  const mouseX = point[0];
  const mouseY = point[1];

  /** 获取tooltip大小 */
  const boxWidth = size.contentSize[0];
  const boxHeight = size.contentSize[1];

  if (boxWidth > mouseX) {
    /** 左边放不下 */
    x = 5;
  } else {
    x = mouseX - boxWidth;
  }

  if (boxHeight > mouseY) {
    /** 上面放不下 */
    y = 5;
  } else {
    y = mouseY - boxHeight;
  }
  return [x, y];
}
