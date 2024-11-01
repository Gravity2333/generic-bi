import useDynamicTheme from '@/hooks/useDynamicTheme';
import { queryDashboards } from '@/services/dashboard';
import { IDashboardFormData, ITimeRange } from '@bi/common';
import { createContext, useEffect, useMemo, useState } from 'react';
import GlobalLayout from '../GlobalLayout';
import useOuterSystemTime from '@/hooks/useOuterSystemTime';
import { useLocation } from 'umi';

interface Props {
  children: React.ReactNode;
}

export interface IDashboardContext {
  dashboards?: IDashboardFormData[];
  dashboardsLoading?: boolean;
  rangeFromOutSystem?: ITimeRange;
  location?: any;
  pageEmbed?: boolean
}

export const DashboardContext = createContext<IDashboardContext>({});

const DashboardLayout = ({ children }: Props) => {
  useDynamicTheme();
  const [dashboards, setDashboards] = useState<IDashboardFormData[]>([]);
  const [dashboardsLoading, setDashboardsLoading] = useState<boolean>(false);
  const location = useLocation<any>();
  // 外部系统时间
  const [rangeFromOutSystem] = useOuterSystemTime(location);
  const pageEmbed = useMemo(() => {
    return location?.pathname?.includes('/embed/');
  }, [location]);
  useEffect(() => {
    (async () => {
      setDashboardsLoading(true);
      const { success, data } = await queryDashboards({});
      if (!success) {
        setDashboardsLoading(false);
        return;
      }
      setDashboards(data.rows);
      setDashboardsLoading(false);
    })();
  }, []);

  return (
    <GlobalLayout
      children={
        <DashboardContext.Provider
          value={{
            dashboards,
            dashboardsLoading,
            location,
            rangeFromOutSystem,
            pageEmbed,
          }}
        >
          {children}
        </DashboardContext.Provider>
      }
    />
  );
};

export default DashboardLayout;
