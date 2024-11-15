import { queryDashboardDetail } from '@/services/dashboard';
import { IDashboardFormData } from '@bi/common';
import { Result, Skeleton } from 'antd';
import { useEffect, useState } from 'react';
import { useParams } from 'umi';
import DashboardEditor from '../Editor';
import CenteredCard from '@/components/CenteredCard';

export default function DashboardUpdate() {
  const { dashboardId } = useParams<any>();
  const [loading, setQueryLoading] = useState(true);
  const [dashboardDetail, setDashboardDetail] = useState<IDashboardFormData>();

  useEffect(() => {
    queryDashboardDetail(dashboardId)
      .then(({ success, data }) => {
        setDashboardDetail(success ? data : ({} as IDashboardFormData));
      })
      .finally(() => {
        setQueryLoading(false);
      });
  }, [dashboardId]);

  if (loading) {
    return <Skeleton active />;
  }
  if (!dashboardDetail?.id) {
    return <Result status="warning" title="没有找到相关的 Dashboard" />;
  }

  return (
    <CenteredCard>
      <DashboardEditor dashboard={dashboardDetail} />;
    </CenteredCard>
  );
}
