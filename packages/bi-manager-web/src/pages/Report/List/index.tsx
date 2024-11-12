import { deleteReport, queryReports, sendReportMail } from '@/services/report';
import ProTable, { ActionType, ProColumns } from '@ant-design/pro-table';
import {
  EAttachmentSource,
  EAttachmentType,
  ECronType,
  EReportSenderType,
  IReportFormData,
  ISendorOptions,
} from '@bi/common';
import { Button, Card, message, Popconfirm, Tag } from 'antd';
import { useRef } from 'react';
import { history } from 'umi';
import cronstrue from 'cronstrue/i18n';
import { proTableSerchConfig } from '@/common';
import { PlusOutlined } from '@ant-design/icons';
import styles from './index.less';
import { getTablePaginationDefaultSettings } from '@/utils/pagination';
import MailConfigAlert from '../components/MailConfigAlert';
import useAttachmentSourceMap from '../hooks/useAttachmentSourceMap';
import ReportLogModal from '../components/ReportLogModal';
import useEmbed from '@/hooks/useEmbed';
import useVariable, { UseVariableParams } from 'use-variable-hook';

const DEFAULT_PAGE_SIZE = 10;
const DEFAULT_PAGE = 1;

const ReportListVariable: UseVariableParams = {
  variables: {
    frozeRows: {},
    currentReport: {},
    showLogs: false,
    hasOnlineSensor: true,
  },
  effects: {
    runReport: ({ call }, { store: { frozeRows } }, id) => {
      message.loading({
        content: '执行中',
        duration: 0,
      });
      const { success } = call(sendReportMail, id);
      message.destroy();
      if (!success) {
        message.error('执行失败！');
        return;
      }
      message.success('执行成功!');
      frozeRows[id] = true;
      setTimeout(() => {
        frozeRows[id] = false;
      }, 5000);
    },
  },
};

type ReportListVariableTypes = {
  frozeRows: Record<string, boolean>;
  currentReport: IReportFormData;
  showLogs: boolean;
};

export default function List() {
  const actionRef = useRef<ActionType>();
  /** 附件来源Map */
  const [attachmentSourceMap] = useAttachmentSourceMap();
  /** 变量列表 */
  const [variables, dispatch] = useVariable<ReportListVariableTypes>(ReportListVariable);
  /** 是否内嵌 */
  const [embed] = useEmbed();
  /** 表格列 */
  const columns: ProColumns<IReportFormData>[] = [
    {
      title: '名称',
      dataIndex: 'name',
      ellipsis: true,
      align: 'left',
    },
    {
      title: '仪表盘/图表',
      dataIndex: 'dashboard_ids',
      align: 'left',
      search: false,
      width: 300,
      render: (_, record) => {
        const { attachment } = (JSON.parse(record.sender_options) as ISendorOptions) || {};
        const { dashboard_ids, widget_ids } = attachment || {
          attachment_source: EAttachmentSource.DASHBOARD,
          attachment_type: EAttachmentType.PDF,
          dashboard_ids: record.dashboard_ids,
        };
        const tagElem = (dashboard_ids || widget_ids || []).map((id) => {
          const { name } = attachmentSourceMap[id] || {};
          return (
            <Tag style={{ cursor: 'default' }} color={'blue'}>
              {name}
            </Tag>
          );
        });
        return tagElem;
      },
    },
    {
      title: '执行计划',
      dataIndex: 'cron',
      ellipsis: true,
      align: 'left',
      search: false,
      render: (_, record) => {
        if (record.cron_type === ECronType.Once) {
          return record.exec_time;
        }
        if (record.cron_type === ECronType.Repeat) {
          return cronstrue.toString(record.cron!, { locale: 'zh_CN', use24HourTimeFormat: true });
        }
      },
    },
    {
      title: '时区',
      dataIndex: 'timezone',
      ellipsis: true,
      align: 'left',
      search: false,
    },
    {
      title: '处理方式',
      dataIndex: 'sender_type',
      align: 'left',
      search: false,
      render: (_, record) => {
        return record.sender_type === EReportSenderType.Email
          ? '邮箱外发'
          : EReportSenderType.Snapshot
          ? '快照'
          : '';
      },
    },
    {
      title: '描述',
      dataIndex: 'description',
      align: 'left',
      ellipsis: true,
      search: false,
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      ellipsis: true,
      align: 'left',
      valueType: 'dateTime',
      search: false,
    },
    {
      title: '修改时间',
      dataIndex: 'updated_at',
      ellipsis: true,
      align: 'left',
      valueType: 'dateTime',
      search: false,
    },
    {
      title: '操作',
      dataIndex: 'action',
      ellipsis: true,
      align: 'left',
      search: false,
      width: 220,
      render: (_, record) => {
        return (
          <>
            <Button
              type="link"
              size="small"
              loading={!!variables.frozeRows?.[record.id!]}
              onClick={() => {
                dispatch({
                  type: 'runReport',
                  payload: record.id,
                });
              }}
            >
              执行
            </Button>
            <Button
              type="link"
              size="small"
              onClick={async () => {
                variables.currentReport = record;
                variables.showLogs = true;
              }}
            >
              结果
            </Button>
            <Button
              type="link"
              size="small"
              onClick={() => {
                if (!embed) {
                  history.push(`/report/${record.id}/update`);
                } else {
                  history.push(`/embed/report/${record.id}/update`);
                }
              }}
            >
              修改
            </Button>
            <Popconfirm
              title="确定删除吗？"
              onConfirm={async () => {
                const { success } = await deleteReport(record.id!);
                if (!success) {
                  message.error('删除失败!');
                }
                message.success('删除成功!');
                actionRef.current?.reload();
              }}
            >
              <Button type="link" size="small">
                删除
              </Button>
            </Popconfirm>
          </>
        );
      },
    },
  ];

  return (
    <Card
      title={undefined}
      size="small"
      className={styles['outer-card']}
      bodyStyle={{ height: '100%' }}
    >
      <div className={styles['pro-table-auto-height']}>
        {/* 邮箱配置提醒 */}
        <MailConfigAlert />
        <ProTable
          rowKey="id"
          bordered
          size="small"
          columns={columns}
          actionRef={actionRef}
          request={async (params) => {
            const { current, pageSize, name } = params;
            const { success, data } = await queryReports({
              name,
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
          pagination={getTablePaginationDefaultSettings()}
          search={{
            ...proTableSerchConfig,
            span: 12,
            optionRender: (searchConfig, formProps, dom) => [
              ...dom.reverse(),
              <Button
                icon={<PlusOutlined />}
                onClick={() => {
                  if (!embed) {
                    history.push('/report/create');
                  } else {
                    history.push('/embed/report/create');
                  }
                }}
                key="created"
                type="primary"
              >
                新建
              </Button>,
            ],
          }}
          toolBarRender={false}
        />
        <ReportLogModal
          reportId={variables.currentReport?.id || ''}
          showLogs={variables.showLogs}
          setShowLogs={(modalSwitch) => {
            variables.showLogs = modalSwitch;
          }}
        />
      </div>
    </Card>
  );
}
