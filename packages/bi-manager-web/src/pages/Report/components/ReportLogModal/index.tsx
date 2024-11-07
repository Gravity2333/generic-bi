import { PAGE_DEFAULT_SIZE } from '@/components/CustomPagination';
import { downloadLog, queryReportLogs } from '@/services/report';
import { removeObjectNullValue } from '@/utils';
import { getTablePaginationDefaultSettings } from '@/utils/pagination';
import {
  EReportJobExecutionResult,
  EReportJobStatus,
  EReportJobTriggerType,
  IReportJobLog,
} from '@bi/common';
import { Button, Modal, Table } from 'antd';
import { ColumnType } from 'antd/lib/table';
import moment from 'moment';
import { useCallback } from 'react';
import usePolling from 'use-polling-hook';
import useVariable, { UseVariableParams } from 'use-variable-hook';

/** 日志列定义 */
const logColumns: ColumnType<IReportJobLog>[] = [
  {
    title: '创建时间',
    dataIndex: 'created_at',
    ellipsis: true,
    align: 'center',
    width: 300,
    render: (_, record) => {
      return moment(record.created_at).format('YYYY-MM-DD HH:mm:ss');
    },
  },
  {
    title: '触发方式',
    dataIndex: 'trigger_type',
    ellipsis: true,
    align: 'center',
    render: (_, record) => {
      const { trigger_type } = record;
      if (trigger_type === EReportJobTriggerType?.Cron) {
        return 'cron 表达式';
      }
      if (trigger_type === EReportJobTriggerType?.Once) {
        return '人工触发';
      }
    },
  },
  {
    title: '任务状态',
    dataIndex: 'status',
    ellipsis: true,
    align: 'center',
    render: (_, record) => {
      return record['status'] === '0' ? '执行中' : '执行完成';
    },
  },
  {
    title: '执行结果',
    dataIndex: 'execution_result',
    ellipsis: true,
    align: 'center',
    render: (_, record) => {
      return record['execution_result'] === '0' ? '成功' : '失败';
    },
  },
  {
    title: '日志',
    dataIndex: 'execution_log',
    ellipsis: true,
    align: 'center',
  },
  {
    title: '操作',
    ellipsis: true,
    align: 'center',
    render: (_, record) => {
      const { id, report_id, execution_result, status } = record;
      return (
        <>
          <Button
            type="link"
            size="small"
            onClick={() => {
              downloadLog(report_id, id);
            }}
            disabled={
              !(
                status === EReportJobStatus.Finished &&
                execution_result === EReportJobExecutionResult.Success
              )
            }
          >
            下载
          </Button>
        </>
      );
    },
  },
];

type Pagination = { page: number; pageSize: number };
const defaultTablePaginationDefaultSettings = getTablePaginationDefaultSettings();

type ReportLogModalVariablesType = {
  pagination: Pagination;
  totalElements: number;
  tableData: IReportJobLog[];
  searchParams: Record<string, any>;
};
const ReportLogModalVariables: UseVariableParams = {
  variables: {
    pagination: {
      page: 1,
      pageSize: defaultTablePaginationDefaultSettings.pageSize! || PAGE_DEFAULT_SIZE,
    },
    searchParams: {},
    totalElements: 0,
    tableData: [],
  },
  reducers: {
    updatePagination(store, { payload }) {
      store.pagination = payload;
    },
  },
  effects: {
    fetchReportLogs({ call, Control }, { store }, queryParams) {
      const { success, data } = call(queryReportLogs, queryParams);
      if (success) {
        store.tableData = data.rows;
        store.totalElements = data.total;
      }
      Control.return({});
    },
  },
};

function PollingTable({ reportId }: { reportId: string }) {
  const [variables, dispatch] = useVariable<ReportLogModalVariablesType>(ReportLogModalVariables);
  const { pagination, tableData, totalElements, searchParams } = variables;
  /** 轮巡函数 */
  const pollingFn = useCallback((queryParams) => {
    return dispatch({
      type: 'fetchReportLogs',
      payload: queryParams,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [loading] = usePolling({
    interval: 1000,
    pollingFn,
    params: removeObjectNullValue({
      pageNumber: pagination.page - 1,
      pageSize: pagination.pageSize,
      ...searchParams,
      reportId,
    }),
  });

  return (
    <Table<IReportJobLog>
      rowKey="id"
      bordered
      size="small"
      columns={logColumns}
      loading={loading}
      dataSource={tableData}
      pagination={{
        ...getTablePaginationDefaultSettings({
          onChangePage: (page, pageSize) => {
            dispatch({
              type: 'updatePagination',
              payload: { page, pageSize },
            });
          },
        }),
        total: totalElements,
      }}
    />
  );
}

export default function ReportLogModal({
  setShowLogs,
  showLogs,
  reportId,
}: {
  setShowLogs: (arg: boolean) => void;
  showLogs: boolean;
  reportId: string;
}) {
  return (
    <Modal
      title="结果"
      visible={showLogs}
      width={1000}
      onCancel={() => {
        setShowLogs(false);
      }}
      destroyOnClose
      footer={false}
    >
      <PollingTable reportId={reportId} />
    </Modal>
  );
}
