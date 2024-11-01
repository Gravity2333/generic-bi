import {
  queryAllDashboards,
  queryDashboardDetail,
  deleteDashboard,
  syncDashboardSeq,
} from '@/services/dashboard';
import { IDashboardFormData, SYSTEM_DASHBOARD_ID } from '@bi/common';
import { Skeleton, Tabs, Result, Modal, message } from 'antd';
import type { TabsProps } from 'antd';
import { useEffect, useState, useMemo } from 'react';
import DashboardEditor from '../Editor';
import { history, useLocation } from 'umi';
import DraggableTabs from '../components/DraggableTabs';
import { sendMsgToParent } from '@/utils/sendMsgToParent';
import React from 'react';
import useVariable from '@/hooks/useVariable';
import { UseVariableParams } from '@/hooks/useVariable/typings';

interface IEmbedTabContextType {
  queryList: (showLoading: boolean) => void;
  fetchDashboardDetail: () => void;
}

export const EmbedTabContext = React.createContext<IEmbedTabContextType>({} as any);

const variableConfig: UseVariableParams = {
  variables: {
    dashboardList: [],
    selectedDashboardId: '',
    dashboardDetail: {},
  },
  effects: {
    fetchDashboardList: ({ call, setLoading }, { store }, payload) => {
      if (payload?.showLoading) {
        setLoading(true);
      }
      const { success, data } = call(queryAllDashboards, {});
      const list = success ? data : [];
      const rankedList = [...list];
      const defaultIndex = rankedList.findIndex((d) => d.id === SYSTEM_DASHBOARD_ID);
      if (defaultIndex >= 0) {
        const [defaultDashboard] = rankedList.splice(defaultIndex, 1);
        rankedList.unshift(defaultDashboard);
      }
      store.dashboardList = rankedList;
      if (rankedList.length > 0) {
        store.selectedDashboardId = payload?.dashboardTabId
          ? payload?.dashboardTabId
          : rankedList[0].id;
      }
      setLoading(false);
    },
    fetchDashboardDetail: ({ call, setLoading }, { store }, payload) => {
      if (!store.selectedDashboardId) {
        store.dashboardDetail = undefined;
      }
      setLoading(true);
      const { success, data } = call(queryDashboardDetail, payload);
      store.dashboardDetail = success ? data : ({} as IDashboardFormData);
      setLoading(false);
    },
  },
};

interface DashboardTabDataType {
  dashboardList: any[];
  selectedDashboardId: string;
  dashboardDetail: any;
}

export default () => {
  const [variables, dispatch, loading] = useVariable<DashboardTabDataType>(variableConfig);

  const { dashboardList, selectedDashboardId, dashboardDetail } = variables;

  const queryDashboardListLoading = loading('fetchDashboardList');

  const queryDashboardDetailLoading = loading('fetchDashboardDetail');

  const location = useLocation();
  /** 是否有可用的探针 */
  const [hasOnlineSensor, setHasOnlinenSensor] = useState<boolean>(true);

  const queryList = (showLoading: boolean) => {
    dispatch({
      type: 'fetchDashboardList',
      payload: {
        showLoading,
        dashboardTabId: (location as any)?.query?.dashboardTabId,
      },
    });
  };

  const setSelectedDashboardId = (id?: string) => {
    variables.selectedDashboardId = id!;
  };

  const fetchDashboardDetail = () => {
    dispatch({
      type: 'fetchDashboardDetail',
      payload: selectedDashboardId,
    });
  };

  useEffect(() => {
    queryList(true);
  }, [location]);

  useEffect(() => {
    fetchDashboardDetail();
  }, [selectedDashboardId]);

  const renderdDashboard = useMemo(() => {
    if (queryDashboardDetailLoading) {
      return <Skeleton active />;
    }
    if (!dashboardDetail?.id) {
      return <Result status="warning" title="没有找到相关的仪表盘" />;
    }
    return <DashboardEditor dashboard={dashboardDetail} preview tab />;
  }, [dashboardDetail?.id, dashboardDetail, queryDashboardDetailLoading]);

  const handleEdit: TabsProps['onEdit'] = async (targetKey, action) => {
    if (action === 'add') {
      history.push(
        `/embed/dashboard/create?from=${(location as any)?.query?.from}&to=${
          (location as any)?.query?.to
        }`,
      );
    }
    if (action === 'remove') {
      Modal.confirm({
        title: '确定删除吗？',
        onOk: async () => {
          const { success } = await deleteDashboard(targetKey as string);
          // 如果不是当前选择的，无操作
          // 如果是当前选中的，要切换当前选中的
          // if(targetKey === )
          if (!success) {
            message.error('删除失败');
            return;
          }
          if (targetKey === selectedDashboardId) {
            // 切换新的dashboard
            // 当前所在的索引位置
            let newIndex;
            const currentIndex = dashboardList.findIndex((el) => el.id === selectedDashboardId);
            if (currentIndex - 1 >= 0) {
              // 先找前一个
              newIndex = currentIndex - 1;
            } else if (currentIndex + 1 < dashboardList.length) {
              // 再找后一个
              newIndex = currentIndex + 1;
            }
            if (!newIndex) {
              setSelectedDashboardId(undefined);
            } else {
              setSelectedDashboardId(dashboardList[newIndex]?.id || undefined);
            }
          }
          // 最后都需要更新下新的列表
          queryList(false);
        },
      });
    }
  };

  const handleChange: TabsProps['onChange'] = (activeKey) => {
    setSelectedDashboardId(activeKey);
    sendMsgToParent({
      dashboardTabId: activeKey,
    });
  };

  const handleDragEnd = (idList: string[]) => {
    // 同步tab顺序
    syncDashboardSeq(idList.join(','));
  };

  if (queryDashboardListLoading) {
    return <Skeleton active />;
  }

  return (
    <EmbedTabContext.Provider
      value={{
        queryList,
        fetchDashboardDetail,
      }}
    >
      <div
        style={{ display: 'flex', flexFlow: 'column nowrap', height: '100%', overflow: 'hidden' }}
      >
        <div>
          <DraggableTabs
            type="editable-card"
            destroyInactiveTabPane
            activeKey={selectedDashboardId}
            onEdit={handleEdit}
            onChange={handleChange}
            dragEnd={handleDragEnd}
          >
            {dashboardList.map((row) => (
              <Tabs.TabPane
                tab={row.name}
                key={row.id}
                closable={row?.readonly === '0'}
              ></Tabs.TabPane>
            ))}
          </DraggableTabs>
        </div>
        <div style={{ flex: '1 0', overflow: 'auto' }}>{renderdDashboard}</div>
      </div>
    </EmbedTabContext.Provider>
  );
};
