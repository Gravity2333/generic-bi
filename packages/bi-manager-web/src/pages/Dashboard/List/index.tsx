import { API_PREFIX, BI_AUTH_TOKEN_KEY, isDev, proTableSerchConfig } from '@/common';
import {
  batchDeleteDashboard,
  deleteDashboard,
  exportDashboard,
  queryDashboards,
} from '@/services/dashboard';
import { BarsOutlined, PlusOutlined, UploadOutlined } from '@ant-design/icons';
import ProTable, { ActionType, ProColumns } from '@ant-design/pro-table';
import { IDashboardFormData } from '@bi/common';
import { Badge, Button, Checkbox, message, Popconfirm, Popover, Upload } from 'antd';
import { useRef, useState } from 'react';
import { history } from 'umi';
import styles from './index.less';
import { getTablePaginationDefaultSettings } from '@/utils/pagination';
import useEmbed from '@/hooks/useEmbed';

const biToken = window.localStorage.getItem(BI_AUTH_TOKEN_KEY);

const ExportDashboard = ({ keys }: { keys: React.Key[] }) => {
  const [exportWidgets, setExportWidgets] = useState<boolean>(false);
  return (
    <Popover
      content={
        <>
          <Checkbox
            onChange={(e) => {
              setExportWidgets(e.target.checked);
            }}
          >
            导出引用的图表
          </Checkbox>
          <Button
            type="link"
            onClick={() => {
              exportDashboard({
                ids: keys.join(','),
                exportWidgets,
              });
            }}
          >
            确定
          </Button>
        </>
      }
      trigger="click"
    >
      <Button type="link" size="small">
        导出
      </Button>
    </Popover>
  );
};

export default function DashboardList() {
  const actionRef = useRef<ActionType>();

  const [embed] = useEmbed();

  /** 勾选的仪表盘 */
  const [selectedWidget, setSelectedWidget] = useState<IDashboardFormData[]>([]);

  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const columns: ProColumns<IDashboardFormData>[] = [
    {
      title: '名称',
      dataIndex: 'name',
      align: 'left',
      width: '300px',
      render: (_, record) => {
        if (record?.readonly === '1') {
          return (
            <div style={{ position: 'relative' }}>
              <Badge.Ribbon
                placement="start"
                text="内置"
                style={{ position: 'absolute', top: '-10px', left: '-15px' }}
                color="gray"
              >
                <span>{record?.name}</span>
              </Badge.Ribbon>
            </div>
          );
        }
        return record?.name;
      },
    },
    {
      title: '描述',
      dataIndex: 'description',
      search: false,
      align: 'left',
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      align: 'left',
      search: false,
      valueType: 'dateTime',
    },
    {
      title: '修改时间',
      dataIndex: 'updated_at',
      align: 'left',
      search: false,
      valueType: 'dateTime',
    },
    {
      title: '操作',
      width: 200,
      align: 'left',
      search: false,
      dataIndex: 'action',
      render: (text, record: any) => {
        return (
          <>
            <Button
              type="link"
              size="small"
              onClick={() => {
                if (embed) {
                  history.push(`/embed/dashboard/${record.id}/preview`);
                } else {
                  history.push(`/dashboard/${record.id}/preview`);
                }
              }}
            >
              预览
            </Button>
            <Button
              type="link"
              size="small"
              disabled={!isDev && record?.readonly === '1'}
              onClick={() => {
                if (embed) {
                  history.push(`/embed/dashboard/${record.id}/update`);
                } else {
                  history.push(`/dashboard/${record.id}/update`);
                }
              }}
            >
              修改
            </Button>
            <Popconfirm
              title="确定删除吗？"
              disabled={record?.readonly === '1'}
              onConfirm={async () => {
                const { success } = await deleteDashboard(record.id);
                if (success) {
                  message.success('删除成功');
                  actionRef.current?.reload();
                }
              }}
            >
              <Button type="link" size="small" disabled={record?.readonly === '1'}>
                删除
              </Button>
            </Popconfirm>
          </>
        );
      },
    },
  ];

  const operationLineRender = () => {
    let deletable = true;
    for (const w of selectedWidget) {
      if (w.readonly === '1') {
        deletable = false;
        break;
      }
    }
    return (
      <div>
        <ExportDashboard keys={selectedRowKeys} />
        <Popconfirm
          title="确定删除吗？"
          onConfirm={async () => {
            const { success } = await batchDeleteDashboard(selectedRowKeys.join(','));
            if (success) {
              message.success('删除成功!');
              actionRef.current?.reload();
              setSelectedRowKeys([]);
            } else {
              message.error('删除失败!');
              actionRef.current?.reload();
              setSelectedRowKeys([]);
            }
          }}
          disabled={!deletable}
        >
          <Button type="link" size="small" disabled={!deletable}>
            删除
          </Button>
        </Popconfirm>
        <Button
          type="link"
          size="small"
          onClick={() => {
            setSelectedRowKeys([]);
            setSelectedWidget([]);
          }}
        >
          取消选择
        </Button>
      </div>
    );
  };

  return (
    <div className={styles['pro-table-auto-height']}>
      <ProTable
        rowKey="id"
        bordered
        size="small"
        columns={columns}
        actionRef={actionRef}
        style={{ margin: '10px' }}
        request={async (params = {}) => {
          const { success, data } = await queryDashboards({
            pageNumber: params.current! - 1,
            pageSize: params.pageSize,
          });

          return {
            data: success ? data.rows : [],
            success: success,
            total: success ? data.total : 0,
          };
        }}
        pagination={getTablePaginationDefaultSettings()}
        rowSelection={{
          type: 'checkbox',
          selectedRowKeys,
          onChange: (selectedRowKeys: React.Key[], widgets) => {
            setSelectedWidget(widgets);
            setSelectedRowKeys(selectedRowKeys);
          },
        }}
        tableAlertOptionRender={operationLineRender}
        search={{
          ...proTableSerchConfig,
          span: 10,
          optionRender: (searchConfig, formProps, dom) => [
            <Button
            icon={<BarsOutlined />}
            onClick={() => {
              history.push('/embed/dashboard/tab');
            }}
            key="tab"
          >
            展示模式
          </Button>,
          dom.reverse(),
          <Button
            icon={<PlusOutlined />}
            onClick={() => {
              if (embed) {
                history.push('/embed/dashboard/create');
              } else {
                history.push('/dashboard/create');
              }
            }}
            key="created"
            type="primary"
          >
            新建
          </Button>,
          <Upload
            {...{
              name: 'file',
              headers: {
                ...(biToken ? { Authorization: `Bearer ${biToken}` } : {}),
              },
              method: 'post',
              action: `${API_PREFIX}/dashboards/as-import`,
              showUploadList: false,
              withCredentials: true,
              onChange(info) {
                if (info.file.status !== 'uploading') {
                  message.loading('上传中!');
                }
                if (info.file.status === 'done') {
                  message.destroy();
                  message.success(`上传完成!`);
                  actionRef.current?.reload();
                } else if (info.file.status === 'error') {
                  message.destroy();
                  message.error(`上传失败!`);
                }
              },
              accept: '.bi',
            }}
          >
            <Button icon={<UploadOutlined />}>导入</Button>
          </Upload>
          ],
        }}
        toolBarRender={false}
      />
    </div>
  );
}
