import { queryDatasources } from '@/services/dataset';
import { IClickhouseTable } from '@bi/common';
import { useEffect, useState } from 'react';

export default function useDatasources(databaseId: string) {
  const [datasets, setDatasets] = useState<IClickhouseTable[]>([]);
  const queryDatasets = async () => {
    if (!databaseId) return;
    const { success, data } = await queryDatasources(databaseId);
    if (success) {
      setDatasets(data);
    }
  };

  useEffect(() => {
    queryDatasets();
  }, [databaseId]);

  return [datasets, () => queryDatasets()] as [IClickhouseTable[], () => void];
}
