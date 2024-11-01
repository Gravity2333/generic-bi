import { ITimeRangeContext, TimeRangeContext } from '@/pages/Dashboard/Editor';
import BigNumberRender, {
  BigNumberValueType,
  DEFAULT_NUMBER_STYLE,
} from '@/pages/Widget/components/Renderer/components/BigNumberRender';
import { queryAlarms } from '@/services/global';
import { jumpToParent } from '@/utils/sendMsgToParent';
import { getTimeRange } from '@bi/common';
import moment from 'moment';
import { useContext, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'umi';

export const ALARM_NAME = '设备告警';

export default function () {
  const [activeNum, setActiveNum] = useState<number>(0);
  const { time_range } = useContext<ITimeRangeContext>(TimeRangeContext);
  const [from, to] = useMemo(() => {
    if (time_range) {
      return getTimeRange(time_range);
    }
    return getTimeRange({
      type: 'range',
      range: 30,
      unit: 'm',
      include_lower: false,
      include_upper: false,
    } as any);
  }, [time_range]);

  const location = useLocation();
  const canJump = useMemo(() => {
    return location?.pathname?.includes('/dashboard/tab');
  }, [location]);

  useEffect(() => {
    (async () => {
      const { success, data } = await queryAlarms({
        from: moment(from).format('YYYY-MM-DDTHH:mm:ss+08:00'),
        to: moment(to).format('YYYY-MM-DDTHH:mm:ss+08:00'),
      });
      if (success) {
        if(typeof data === 'number'){
          setActiveNum(data);
        }else {
          setActiveNum(0)
        }

      }
    })();
  }, [from, to]);

  return (
    <BigNumberRender
      title={ALARM_NAME}
      value={activeNum as BigNumberValueType}
      chartProperties={DEFAULT_NUMBER_STYLE as any}
      onClick={() => {
        if (canJump) {
          jumpToParent(
            `/log-alarm/alarm?from=${moment(
              from,
            ).valueOf()}&to=${moment(to).valueOf()}&init=true&relative=false&timeType=custom`,
            {},
            true,
          );
        }
      }}
    />
  );
}
