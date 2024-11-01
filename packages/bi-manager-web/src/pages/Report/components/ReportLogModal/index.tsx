import { downloadLog, queryReportLogs } from '@/services/report';
import ProTable, { ProColumns } from '@ant-design/pro-table';
import {
  EReportJobExecutionResult,
  EReportJobStatus,
  EReportJobTriggerType,
  IReportJobLog,
} from '@bi/common';
import { Button, Modal } from 'antd';
import moment from 'moment';

const DEFAULT_PAGE_SIZE = 10;
const DEFAULT_PAGE = 1;

/** 日志列定义 */
const logColumns: ProColumns<IReportJobLog>[] = [
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
    valueEnum: {
      '0': { text: '执行中', status: 'Processing' },
      '1': { text: '执行完成', status: 'Success' },
    },
  },
  {
    title: '执行结果',
    dataIndex: 'execution_result',
    ellipsis: true,
    align: 'center',
    valueEnum: {
      '0': { text: '成功', status: 'Success' },
      '1': { text: '失败', status: 'Error' },
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
export default function ReportLogModal({
  setShowLogs,
  showLogs,
  reportId,
}: {
  setShowLogs: (arg: boolean)=>void;
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
      <ProTable
        rowKey="id"
        bordered
        size="small"
        columns={logColumns}
        request={async (params) => {
          const { current, pageSize } = params;
          const { success, data } = await queryReportLogs({
            reportId: reportId || '',
            pageSize: pageSize || DEFAULT_PAGE_SIZE,
            pageNumber: (current || DEFAULT_PAGE) - 1,
          });
          if (!success) {
            return {
              data: [],
              success,
            };
          }
          const { rows, total, pageNumber } = data as any;
          return {
            data: rows,
            success: success,
            page: pageNumber,
            total,
          };
        }}
        pagination={{
          defaultPageSize: DEFAULT_PAGE_SIZE,
          defaultCurrent: DEFAULT_PAGE,
          showSizeChanger: true,
        }}
        search={false}
        toolBarRender={false}
      />
    </Modal>
  );
}
