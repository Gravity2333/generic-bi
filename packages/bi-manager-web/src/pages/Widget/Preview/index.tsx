import { ITimeRangeContext, TimeRangeContext } from '@/pages/Dashboard/Editor';
import { cancelQueryWidgetData, queryWidgetData, queryWidgetDetail } from '@/services';
import { LoadingOutlined } from '@ant-design/icons';
import {
  EVisualizationType,
  IReferenceResult,
  IWidgetFormData,
  IWidgetSpecification,
  parseObjJson,
  timeRangeEmpty,
} from '@bi/common';
import { Result, Spin } from 'antd';
import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import WidgetRender from '../components/Renderer';
import { v4 as uuidv4 } from 'uuid';
import { GlobalContext, IGlobalContext } from '@/layouts/GlobalLayout';

interface IWidgetPreviewProps {
  widgetId: string;
  onWidgetReady?: (widget?: IWidgetFormData) => void;
}

interface IWidgetInfo {
  /** widget 详情信息 */
  widget: IWidgetFormData;
  /** widget 查询数据结果 */
  queriesData: any;
  sql: string;
  explain: string;
  colNames: string[];
  colIdList: string[];
  references?: IReferenceResult[];
  success: boolean;
}
const WidgetPreview = ({ widgetId, onWidgetReady }: IWidgetPreviewProps) => {
  const { datasets: schemaDetails = [], dicts = [] } = useContext<IGlobalContext>(GlobalContext);
  const { time_range, time_grain } = useContext<ITimeRangeContext>(TimeRangeContext);
  const [queryLoading, setQueryLoading] = useState(true);
  const queryLoadingRef = useRef<boolean>(false);

  useEffect(() => {
    queryLoadingRef.current = queryLoading;
  }, [queryLoading]);
  const [widgetInfo, setWidgetInfo] = useState<IWidgetInfo>();

  const queryId = useMemo(() => {
    return uuidv4();
  }, []);

  /** 取消查询 */
  useEffect(() => {
    const cancelQuery = () => {
      if (queryLoadingRef.current) {
        cancelQueryWidgetData(queryId);
      }
    };
    return cancelQuery;
  }, []);

  useEffect(() => {
    if (onWidgetReady) {
      onWidgetReady(widgetInfo?.widget);
    }
  }, [widgetInfo?.widget]);

  useEffect(() => {
    if (schemaDetails?.length === 0) {
      setQueryLoading(false);
      return;
    }

    setQueryLoading(true);
    let timer: NodeJS.Timer;

    (async () => {
      const widgetDetail = await queryWidgetDetail(widgetId);
      let info = {};
      const specObj = parseObjJson<IWidgetSpecification>(widgetDetail?.data?.specification);
      const widgetqueriesData =
        (await queryWidgetData(
          widgetId,
          queryId,
          (() => {
            if (!time_range) {
              return time_range;
            }

            if (timeRangeEmpty(time_range)) {
              return undefined;
            }

            if (specObj.viz_type === EVisualizationType.TimeHistogram) {
              return {
                ...time_range,
                include_lower: true,
              };
            } else {
              return time_range;
            }
          })(),
          schemaDetails?.find((schema: any) => schema.name === specObj.datasource)?.exist_rollup
            ? time_grain
            : undefined,
        )) || {};
      if (!widgetDetail.success || !widgetqueriesData.success) {
        setQueryLoading(false);
        return;
      }

      info = {
        widget: {
          ...widgetDetail.data,
          specification: JSON.stringify({
            ...JSON.parse(widgetDetail?.data?.specification),
            ...(() => {
              if (time_range) {
                return {
                  time_range,
                };
              }
              return {};
            })(),
          }),
        },
        ...widgetqueriesData.data,
        queriesData: widgetqueriesData.data.data,
        success: widgetDetail.success && widgetqueriesData.success,
      };

      setWidgetInfo(info as IWidgetInfo);
      setQueryLoading(false);

      /** 定时刷新 */
      const { refresh_time } = (time_range as any)?.refresh_time
        ? { refresh_time: (time_range as any)?.refresh_time * 1000 }
        : parseObjJson<IWidgetSpecification>(widgetDetail.data.specification);
      if (refresh_time) {
        timer = setInterval(async () => {
          const {
            success,
            data: { data },
          } =
            (await queryWidgetData(
              widgetId,
              queryId,
              (() => {
                if (!time_range) {
                  return time_range;
                }
                if (specObj.viz_type === EVisualizationType.TimeHistogram) {
                  return {
                    ...time_range,
                    include_lower: true,
                  };
                } else {
                  return time_range;
                }
              })(),
              schemaDetails?.find((schema: any) => schema.name === specObj.datasource)?.exist_rollup
                ? time_grain
                : undefined,
            )) || {};

          if (!success) {
            return;
          }
          setWidgetInfo({ ...info, queriesData: data } as IWidgetInfo);
        }, refresh_time);
      }
    })();
    return () => clearInterval(timer);
  }, [widgetId, queryId, time_range, time_grain, schemaDetails]);

  if (queryLoading) {
    return (
      <div
        className="widget-loading"
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}
      >
        <Spin indicator={<LoadingOutlined />} />
      </div>
    );
  }

  const {
    success,
    widget,
    queriesData,
    colNames = [],
    sql,
    explain,
    colIdList = [],
    references = [],
  } = widgetInfo || {};

  if (!success) {
    return <Result status="warning" title="查询失败" />;
  }

  return (
    <>
      {widget ? (
        <WidgetRender
          key={widgetId}
          queriesData={queriesData}
          widget={widget}
          sql={sql}
          explain={explain}
          colNames={colNames}
          colIdList={colIdList}
          references={references}
          pure
          dicts={dicts}
          time_range={time_range}
          time_grain={time_grain}
        />
      ) : (
        ''
      )}
    </>
  );
};

export default WidgetPreview;
