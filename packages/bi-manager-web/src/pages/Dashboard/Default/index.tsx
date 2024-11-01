import { queryDashboardDetail } from '@/services/dashboard';
import { IDashboardFormData, SYSTEM_DASHBOARD_ID } from '@bi/common';
import { Skeleton } from 'antd';
import { useEffect, useState } from 'react';
import DashboardEditor from '../Editor';

export default () => {
  // dashboard 详情
  const [queryDashboardDetailLoading, setQueryDashboardDetailLoading] = useState(true);
  const [dashboardDetail, setDashboardDetail] = useState<IDashboardFormData>();

  useEffect(() => {
    setQueryDashboardDetailLoading(true);
    queryDashboardDetail(SYSTEM_DASHBOARD_ID)
      .then(({ success, data }) => {
        setDashboardDetail(success ? data : ({} as IDashboardFormData));
      })
      .finally(() => {
        setQueryDashboardDetailLoading(false);
      });
  }, []);

  if (queryDashboardDetailLoading) {
    return <Skeleton active />;
  }
  return <DashboardEditor dashboard={dashboardDetail} embed={true} preview tab />;
};
