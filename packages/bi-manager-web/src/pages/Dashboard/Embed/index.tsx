import { queryDashboardDetail } from '@/services/dashboard';
import { IDashboardFormData } from '@bi/common';
import { Skeleton, Result } from 'antd';
import { useEffect, useState, useCallback } from 'react';
import { useLocation, useParams } from 'umi';
import DashboardEditor from '../Editor';

export default () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation<any>()
  // dashboard 详情
  const [queryDashboardDetailLoading, setQueryDashboardDetailLoading] = useState(true);
  const [dashboardDetail, setDashboardDetail] = useState<IDashboardFormData>();

  useEffect(() => {
    if (!id) {
      setDashboardDetail(undefined);
      return;
    }

    setQueryDashboardDetailLoading(true);
    queryDashboardDetail(id)
      .then(({ success, data }) => {
        setDashboardDetail(success ? data : ({} as IDashboardFormData));
      })
      .finally(() => {
        setQueryDashboardDetailLoading(false);
      });
  }, [id]);

  const renderDashboard = useCallback(() => {
    if (queryDashboardDetailLoading) {
      return <Skeleton active />;
    }
    if (!dashboardDetail?.id) {
      return <Result status="warning" title="没有找到相关的仪表盘" />;
    }

    return <DashboardEditor dashboard={dashboardDetail} embed={true} preview tab={!!(location as any)?.query?.hideTitle}  />;
  }, [queryDashboardDetailLoading, dashboardDetail]);

  return <>{renderDashboard()}</>;
};
