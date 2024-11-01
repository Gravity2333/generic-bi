import useDynamicTheme from '@/hooks/useDynamicTheme';
import { ITimeRange } from '@bi/common';
import { createContext, useMemo } from 'react';
import GlobalLayout from '../GlobalLayout';
import useOuterSystemTime from '@/hooks/useOuterSystemTime';
import { useLocation } from 'umi';

interface Props {
  children: React.ReactNode;
}

export interface IWidgetContextContext {
  rangeFromOutSystem?: ITimeRange;
  location?: any;
  pageEmbed?: boolean;
}

export const WidgetContext = createContext<IWidgetContextContext>({} as any);

const WidgetLayout = ({ children }: Props) => {
  useDynamicTheme();
  const location = useLocation<any>();
  // 外部系统时间
  const [rangeFromOutSystem] = useOuterSystemTime(location);
  const pageEmbed = useMemo(() => {
    return location?.pathname?.includes('/embed/');
  }, [location]);

  return (
    <GlobalLayout
      children={
        <WidgetContext.Provider
          value={{
            location,
            rangeFromOutSystem,
            pageEmbed,
          }}
        >
          {children}
        </WidgetContext.Provider>
      }
    />
  );
};

export default WidgetLayout;
