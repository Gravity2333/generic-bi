import { ITimeRangeContext, TimeRangeContext } from '@/pages/Dashboard/Editor';
import BigNumberRender, {
  BigNumberValueType,
  DEFAULT_NUMBER_STYLE,
} from '@/pages/Widget/components/Renderer/components/BigNumberRender';
import { cancelQueryWidgetData } from '@/services';
import { queryActiveAssets } from '@/services/global';
import { jumpToParent } from '@/utils/sendMsgToParent';
import { getTimeRange } from '@bi/common';
import moment from 'moment';
import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'umi';
import { v4 as uuidv4 } from 'uuid';

export const ACTIVE_ASSETS_NAME = '活跃IP资产';

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

  const [queryLoading, setQueryLoading] = useState(true);
  const queryLoadingRef = useRef<boolean>(false);
  useEffect(() => {
    queryLoadingRef.current = queryLoading;
  }, [queryLoading]);

  const [queryId] = useState<string>(uuidv4());

  useEffect(() => {
    (async () => {
      setQueryLoading(true);
      const { success, data } = await queryActiveAssets({
        from: moment(from).valueOf(),
        to: moment(to).valueOf(),
        queryId,
      });
      if (success) {
        setActiveNum(parseInt(data));
      }
      setQueryLoading(false);
    })();
    const cancelQuery = () => {
      if (queryLoadingRef.current) {
        cancelQueryWidgetData(queryId);
      }
    };
    return cancelQuery;
  }, []);

  return (
    <BigNumberRender
      title={ACTIVE_ASSETS_NAME}
      value={activeNum as BigNumberValueType}
      chartProperties={DEFAULT_NUMBER_STYLE as any}
      onClick={() => {
        if (canJump) {
          jumpToParent(
            `/analysis/trace/assets/assetsList?from=${moment(from).valueOf()}&to=${moment(
              to,
            ).valueOf()}&init=latestTime&relative=false&timeType=custom`,
            {},
            true,
          );
        }
      }}
    />
  );
}
