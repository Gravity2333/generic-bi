import { queryDashboardDetail } from '@/services/dashboard';
import { IDashboardFormData } from '@bi/common';
import { Result, Skeleton } from 'antd';
import { useEffect } from 'react';
import { useParams } from 'umi';
import DashboardEditor from '../Editor';
import useVariable from '@/hooks/useVariable';

export default function DashboardUpdate() {
  const { dashboardId } = useParams<any>();
  const [{dashboardDetail},dispatch,loading] = useVariable<{
    dashboardDetail: IDashboardFormData
  }>({
    variables: {
      dashboardDetail: {},
    },
    effects:{
      fetchDashboardDetail: ({ call, setLoading }, { store }, payload) => {
        setLoading(true);
        const { success, data } = call(queryDashboardDetail, payload);
        store.dashboardDetail = success ? data : ({} as IDashboardFormData);
        setLoading(false);
      },
    }
  })
  useEffect(() => {
    dispatch({
      type: 'fetchDashboardDetail',
      payload: dashboardId
    })
  }, [dashboardId]);

  if (loading('fetchDashboardDetail')) {
    return <Skeleton active />;
  }
  if (!dashboardDetail?.id) {
    return <Result status="warning" title="没有找到相关的 Dashboard" />;
  }

  return <DashboardEditor dashboard={dashboardDetail} preview />;
}
