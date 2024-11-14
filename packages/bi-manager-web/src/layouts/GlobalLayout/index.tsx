import useDynamicTheme from '@/hooks/useDynamicTheme';
import { queryAllDicts } from '@/services/dicts';
import { IClickhouseTable, INpmdDict } from '@bi/common';
import { createContext, useCallback, useEffect, useState } from 'react';

interface Props {
  children: React.ReactNode;
}

export interface IGlobalContext {
  dicts?: INpmdDict[];
  dictsLoading?: boolean;
  datasets?: []
}

export const GlobalContext = createContext<IGlobalContext>({});

const GlobalLayout = ({ children }: Props) => {
  useDynamicTheme();
  const [dicts, setDicts] = useState<INpmdDict[]>([]);
  const [dictsLoading, setDictsLoading] = useState<boolean>(false);
  /** 查询字典 */
  const queryDicts = useCallback(async () => {
    setDictsLoading(true);
    const { success, data } = await queryAllDicts();
    setDicts(success ? data : []);
    setDictsLoading(false);
  }, []);

  useEffect(() => {
    queryDicts();
  }, []);

  return (
    <GlobalContext.Provider
      value={{
        dicts,
        dictsLoading,
        datasets: [],
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export default GlobalLayout;
