import { queryWidgetDetail } from '@/services';
import { IWidget } from '@bi/common';
import { Result, Skeleton } from 'antd';
import { Fragment, useEffect, useState } from 'react';
import { useParams } from 'umi';
import WidgetEditor from '../Editor';

export default function WidgetUpdate() {
  const { widgetId } = useParams<any>();
  const [loading, setLoading] = useState<boolean>(true);
  const [widgetDetail, setWidgetDetail] = useState<IWidget>();

  useEffect(() => {
    if (!widgetId) {
      setLoading(false);
      return;
    }
    try{
      queryWidgetDetail(widgetId)
      .then((result) => {
        const { data } = result;
        const widgetDecp = JSON.parse(data.specification);
        setWidgetDetail({
          ...widgetDecp,
          title: data.name,
          description: data.description,
          readonly: data.readonly,
        });
        setLoading(false);
      })
      .catch((err) => {
        setLoading(false);
      });
    }catch(e){
      setLoading(false);
    }
  }, [widgetId]);

  if (loading) {
    return <Skeleton active />;
  }

  if (!widgetDetail) {
    return <Result status="warning" subTitle="没有找到组件." />;
  }

  return (
    <Fragment>
      {widgetDetail && <WidgetEditor widgetDetail={widgetDetail} operateType={'UPDATE'} />}
    </Fragment>
  );
}
