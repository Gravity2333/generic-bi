import useVariable, { UseVariableParams } from 'use-variable-hook'
import { queryAllDashboards } from '@/services/dashboard';
import { queryAllWidgets } from '@/services/widget';
import { useEffect } from 'react';

const AttachmentSourceMapVariable: UseVariableParams = {
  variables: {
    attachmentSourceMap: {},
  },
  effects: {
    fetchAttactmentSourceMap({ call, setLoading }, { store }) {
      setLoading(true);
      const { success: dashboardSuccess, data: dashboards } = call(queryAllDashboards);
      const { success: widgetSuccess, data: widgets } = call(queryAllWidgets);
      if (dashboardSuccess && widgetSuccess) {
        store.attachmentSourceMap = [...widgets, ...dashboards].reduce((prev, curr) => {
          return {
            ...prev,
            [curr.id!]: curr,
          };
        }, {});
      }
      setLoading(false);
    },
  },
};

type AttachmentSourceMapVariableType = {
  attachmentSourceMap: Record<string, any>;
};

export default function useAttachmentSourceMap() {
  const [{ attachmentSourceMap }, dispatch, loading] = useVariable<AttachmentSourceMapVariableType>(
    AttachmentSourceMapVariable,
  );

  useEffect(() => {
    dispatch({ type: 'fetchAttactmentSourceMap' });
  }, []);

  return [attachmentSourceMap, loading('fetchAttactmentSourceMap')] as [
    Record<string, any>,
    boolean,
  ];
}
