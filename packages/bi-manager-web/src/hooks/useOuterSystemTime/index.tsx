import { ETimeSelectType } from '@/pages/Widget/components/ConfigPanel/typings';
import { ITimeRange } from '@bi/common';
import { useEffect, useState } from 'react';

export default function useOuterSystemTime(location: any) {
  const { include_lower, include_upper, refresh_time, relative, unit, range, from, to } =
    (location as any)?.query || {};

  const [timeRange, setTimeRange] = useState<ITimeRange>(() => {
    return {
      include_lower: include_lower ? JSON.parse(include_lower) : false,
      include_upper: include_upper ? JSON.parse(include_upper) : false,
      type: !JSON.parse(relative || 'false') ? ETimeSelectType.CUSTOM : ETimeSelectType.RANGE,
      custom: [from, to],
      range: -parseInt(range),
      unit,
      refresh_time: parseInt(refresh_time),
    } as any;
  });

  // console.log(timeRange, '(外部系统时间)');
  useEffect(() => {
    window.addEventListener('message', ({ data }) => {
      const { time_range } = data || {};
      if (!time_range) {
        return;
      }
      const { include_lower, include_upper, refresh_time, relative, unit, range, from, to } =
        time_range || {};
      setTimeRange({
        include_lower: include_lower ? JSON.parse(include_lower) : false,
        include_upper: include_upper ? JSON.parse(include_upper) : false,
        type: !relative ? ETimeSelectType.CUSTOM : ETimeSelectType.RANGE,
        custom: [from, to],
        range: -parseInt(range),
        unit,
        refresh_time: parseInt(refresh_time),
      } as any);
    });
  }, []);
  return [timeRange];
}
