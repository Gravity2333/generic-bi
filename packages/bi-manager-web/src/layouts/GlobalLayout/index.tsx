import useDynamicTheme from '@/hooks/useDynamicTheme';
import { queryClichhouseTables } from '@/services/dataset';
import { queryAllDicts } from '@/services/dicts';
import { IClickhouseTable, INpmdDict } from '@bi/common';
import { createContext, useCallback, useEffect, useState } from 'react';

interface Props {
  children: React.ReactNode;
}

export interface IGlobalContext {
  dicts?: INpmdDict[],
  dictsLoading?: boolean,
  datasets?: IClickhouseTable[],
  datasetsLoading?: boolean,
}

export const GlobalContext = createContext<IGlobalContext>({});

const GlobalLayout = ({ children }: Props) => {
  useDynamicTheme()
  const [datasets, setDatasets] = useState<IClickhouseTable[]>([])
  const [datasetsLoading, setDatasetsLoading] = useState<boolean>(false)
  const [dicts, setDicts] = useState<INpmdDict[]>([]);
  const [dictsLoading, setDictsLoading] = useState<boolean>(false)
  /** 查询字典 */
  const queryDicts = useCallback(async () => {
    setDictsLoading(true)
    const { success, data } = await queryAllDicts();
    setDicts(success ? data : []);
    setDictsLoading(false)
  }, []);

  /** 查询数据集 */
  const queryDatasets = async () => {
    setDatasetsLoading(true)
    const { success, data } = await queryClichhouseTables()
    if (success) {
      setDatasets(data)
    }
    setDatasetsLoading(false)
  }
  useEffect(() => {
    queryDatasets()
    queryDicts()
  }, [])

  return <GlobalContext.Provider
    value={{
      datasets, dicts,datasetsLoading,dictsLoading
    }}
  >{children}</GlobalContext.Provider>
};

export default GlobalLayout;
