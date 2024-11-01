import EchartsCore from '@/components/EchartsCore';
import { EFormatterType, EVisualizationType, formatValue } from '@bi/common';
import React from 'react';

function DemoChart({
  widgetOption,
  y_axis_format,
  viz_type,
}: {
  widgetOption: any;
  y_axis_format: EFormatterType;
  viz_type: EVisualizationType;
}) {
  const newOpt = {
    ...widgetOption,
  };
  if (viz_type === EVisualizationType.TimeHistogram) {
    newOpt.axisLabel = {
      ...(widgetOption.axisLabel||{}),
      formatter: (val: string) => formatValue(parseFloat(val), y_axis_format),
    };
  }else if(viz_type === EVisualizationType.Bar){
    newOpt.splitLine =  {
      ...(widgetOption.splitLine||{}),
      formatter: (val: string) => formatValue(parseFloat(val), y_axis_format),
    }
    newOpt.label= {
      ...(newOpt.label||{}),
      formatter: (val: any) => {
        return formatValue(parseFloat(val?.data?.value), y_axis_format)
      }
    }
  }
  return <EchartsCore option={newOpt} brush={false} />;
}

export default React.memo(DemoChart);
