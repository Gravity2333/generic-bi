import { formatValue, getTimeRange, parseObjJson } from '../..';
import { getMetricFullName, ITransformEChartOptionsParams } from '..';
import { IWidgetSpecification } from '../../../typings';
import moment from 'moment';

export default function transformProps(params: ITransformEChartOptionsParams) {
  const { widget, queriesData } = params;
  /** 获得groupby */
  const { y_axis_format, metrics,time_range } = parseObjJson<IWidgetSpecification>(
    widget.specification,
  );
  /** Columns排除掉groupby */
  const metricsList = metrics.map((metric) => getMetricFullName(metric));

  if (
    (queriesData && queriesData.length !== 1) ||
    metricsList.length !== 1 ||
    queriesData[0][metricsList[0]] === undefined
  ) {
    return undefined;
  }
  const {isBandwidth} = metrics[0]
  if(isBandwidth&&time_range){
    const [startTime,endTime]= getTimeRange(time_range)
    const timeDiff = (moment(endTime).diff(startTime)/1000) || 1
    return formatValue(parseFloat(queriesData[0][metricsList[0]])/timeDiff, y_axis_format);
  }
  
  return formatValue(parseFloat(queriesData[0][metricsList[0]]), y_axis_format);
}
