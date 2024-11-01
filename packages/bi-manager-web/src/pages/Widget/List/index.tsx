import { API_PREFIX, BI_AUTH_TOKEN_KEY, proTableSerchConfig } from '@/common';
import {
  batchDeleteWidget,
  deleteWidget,
  downloadWidgetCSV,
  downloadWidgetExcel,
  queryWidgets,
  widgetExport,
} from '@/services';
import {
  ExportOutlined,
  FullscreenOutlined,
  PlusOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import ProTable, { ActionType, ProColumns } from '@ant-design/pro-table';
import { CHART_TYPE_LIST, EVisualizationType, IWidgetFormData } from '@bi/common';
import { Badge, Button, Dropdown, Menu, message, Modal, Popconfirm, Tooltip, Upload } from 'antd';
import React, { useRef, useState } from 'react';
import { history } from 'umi';
import AddToDashboard from '../components/Renderer/components/AddToDashboard';
import WidgetPreview from '../Preview';
import FullScreenCard from '@/components/FullScreenCard';
import SQLPreview from '@/pages/SqlLab/components/Preview';
import { downloadSqlJsonCSV, downloadSqlJsonExcel } from '@/services/sqllab';
import styles from './index.less';
import { getTablePaginationDefaultSettings } from '@/utils/pagination';
import useEmbed from '@/hooks/useEmbed';

const DEFAULT_PAGE_SIZE = 10;
const DEFAULT_PAGE = 1;
const biToken = window.sessionStorage.getItem(BI_AUTH_TOKEN_KEY);

export default function WidgetList() {
  const actionRef = useRef<ActionType>();
  /** 预览的widget */
  const [previewWidget, setPreviewWidget] = useState<IWidgetFormData>();

  /** 勾选的widget */
  const [selectedWidget, setSelectedWidget] = useState<IWidgetFormData[]>([]);

  const [embed] = useEmbed();

  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const [fullScreen, setFullScreen] = useState<boolean>(false);

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
        <Button
          type="link"
          size="small"
          onClick={() => {
            widgetExport(selectedRowKeys.join(','));
          }}
        >
          导出
        </Button>
        <Popconfirm
          title="确定删除吗？"
          onConfirm={async () => {
            const { success } = await batchDeleteWidget(selectedRowKeys.join(','));
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

  const columns: ProColumns<IWidgetFormData>[] = [
    {
      title: '名称',
      dataIndex: 'name',
      align: 'left',
      width: 250,
      render: (_, record) => {
        if (record?.readonly === '1') {
          return (
            <div
              style={{
                position: 'relative',
                maxWidth: '250px',
              }}
            >
              <Badge.Ribbon
                placement="start"
                text="内置"
                style={{
                  position: 'absolute',
                  top: '-20px',
                  left: '-15px',
                  zIndex: 10,
                  fontSize: '10px',
                  height: '20px',
                  lineHeight: '20px',
                }}
                color="gray"
              >
                <span>{record?.name}</span>
              </Badge.Ribbon>
            </div>
          );
        }
        if (record?.viz_type === EVisualizationType.SQL) {
          return (
            <div
              style={{
                position: 'relative',
              }}
            >
              <Badge.Ribbon
                placement="start"
                text="SQL查询"
                style={{ position: 'absolute', top: '-10px', left: '-15px' }}
              >
                <span
                  style={{
                    display: 'block',
                    maxWidth: '300px',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                  }}
                >
                  {record?.name}
                </span>
              </Badge.Ribbon>
            </div>
          );
        }
        return record?.name;
      },
    },
    {
      title: '数据源',
      dataIndex: 'datasource',
      align: 'left',
      width: 250,
      search: false,
    },
    {
      title: '图表类型',
      dataIndex: 'viz_type',
      align: 'left',
      width: 150,
      search: false,
      render: (_, record) => {
        return CHART_TYPE_LIST.find((item) => item.value === record.viz_type)?.label;
      },
    },
    {
      title: '描述',
      dataIndex: 'description',
      align: 'left',
      search: false,
      ellipsis: true,
      render: (text: any, record) => {
        return (
          <div
            style={{
              maxWidth: '400px',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
            }}
          >
            {record?.description || ''}
          </div>
        );
      },
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      width: 200,
      align: 'left',
      valueType: 'dateTime',
      search: false,
    },
    {
      title: '修改时间',
      dataIndex: 'updated_at',
      width: 200,
      align: 'left',
      valueType: 'dateTime',
      search: false,
    },
    {
      title: '操作',
      dataIndex: 'action',
      align: 'left',
      fixed: 'right',
      search: false,
      render: (text, record) => {
        return (
          <>
            <Button
              type="link"
              size="small"
              onClick={() => {
                setPreviewWidget(record);
              }}
            >
              预览
            </Button>
            <Button
              type="link"
              size="small"
              onClick={async () => {
                if (embed) {
                  history.push(`/embed/widget/${record.id}/copy`);
                } else {
                  history.push(`/widget/${record.id}/copy`);
                }
              }}
            >
              复制
            </Button>
            <Button
              type="link"
              size="small"
              onClick={() => {
                if (record?.viz_type === EVisualizationType.SQL) {
                  if (embed) {
                    history.push(`/embed/sql-lab?id=${record?.id}`);
                  } else {
                    history.push(`/sql-lab?id=${record?.id}`);
                  }
                } else {
                  if (embed) {
                    history.push(`/embed/widget/${record.id}/update`);
                  } else {
                    history.push(`/widget/${record.id}/update`);
                  }
                }
              }}
            >
              {record?.readonly === '1' ? '查看' : '修改'}
            </Button>
            <Popconfirm
              title="确定删除吗？"
              disabled={record?.readonly === '1'}
              onConfirm={async () => {
                const { success } = await deleteWidget(record.id || '');

                if (success) {
                  message.success('删除成功');
                  actionRef.current?.reload();
                } else {
                  message.error('删除失败');
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

  return (
    <div className={styles['pro-table-auto-height']}>
      <ProTable
        rowKey="id"
        bordered
        size="small"
        columns={columns}
        actionRef={actionRef}
        style={{ margin: '10px' }}
        scroll={{ x: 'max-content' }}
        request={async (params) => {
          const { current, pageSize, name } = params;
          const { success, data } = await queryWidgets({
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
          span: 12,
          optionRender: (searchConfig, formProps, dom) => [
            // <Button
            //   icon={<ConsoleSqlOutlined />}
            //   onClick={() => {
            //     if (embed) {
            //       history.push('/embed/sql-lab');
            //     } else {
            //       history.push('/sql-lab');
            //     }
            //   }}
            //   key="sqllab"
            //   type="primary"
            // >
            //   SQL查询
            // </Button>,
            ...dom.reverse(),
            <Button
              icon={<PlusOutlined />}
              onClick={() => {
                if (embed) {
                  history.push('/embed/widget/create');
                } else {
                  history.push('/widget/create');
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
                action: `${API_PREFIX}/widgets/as-import`,
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
            </Upload>,
          ],
        }}
        toolBarRender={false}
      />

      <Modal
        title={
          <div style={{ position: 'relative' }}>
            {(() => {
              if (previewWidget?.readonly === '1') {
                return (
                  <Badge.Ribbon
                    placement="start"
                    text="内置"
                    style={{ position: 'absolute', top: '-20px', left: '-33px' }}
                    color="gray"
                  >
                    <div>{previewWidget?.name}</div>
                  </Badge.Ribbon>
                );
              } else if (previewWidget?.viz_type === EVisualizationType.SQL) {
                return (
                  <Badge.Ribbon
                    placement="start"
                    text="SQL查询"
                    style={{ position: 'absolute', top: '-20px', left: '-33px' }}
                  >
                    <div>{previewWidget?.name}</div>
                  </Badge.Ribbon>
                );
              }
              return <div>{previewWidget?.name}</div>;
            })()}
            <div style={{ position: 'absolute', right: '30px', top: '-3px' }}>
              {previewWidget?.viz_type === EVisualizationType.Table && (
                <Dropdown
                  overlay={
                    <Menu>
                      <Menu.Item
                        key={'csv'}
                        onClick={() => {
                          downloadWidgetCSV(previewWidget?.id!);
                        }}
                      >
                        导出 CSV 文件
                      </Menu.Item>
                      <Menu.Item
                        key={'excel'}
                        onClick={() => {
                          downloadWidgetExcel(previewWidget?.id!);
                        }}
                      >
                        导出 Excel 文件
                      </Menu.Item>
                    </Menu>
                  }
                  trigger={['click']}
                >
                  <Button
                    // size="small"
                    type="primary"
                    style={{ marginRight: '10px' }}
                    icon={<ExportOutlined />}
                  >
                    导出
                  </Button>
                </Dropdown>
              )}
              {previewWidget?.viz_type === EVisualizationType.SQL && (
                <Dropdown
                  overlay={
                    <Menu>
                      <Menu.Item
                        key={'csv'}
                        onClick={() => {
                          downloadSqlJsonCSV(previewWidget?.specification);
                        }}
                      >
                        导出 CSV 文件
                      </Menu.Item>
                      <Menu.Item
                        key={'excel'}
                        onClick={() => {
                          downloadSqlJsonExcel(previewWidget?.specification);
                        }}
                      >
                        导出 Excel 文件
                      </Menu.Item>
                    </Menu>
                  }
                  trigger={['click']}
                >
                  <Button type="primary" icon={<ExportOutlined />} style={{ marginRight: '10px' }}>
                    导出
                  </Button>
                </Dropdown>
              )}
              <AddToDashboard
                btnType="default"
                title="添加到仪表盘"
                isCheckSaved={false}
                id={previewWidget?.id}
                mode="button"
              />
              <Tooltip title={'全屏展示'}>
                <Button
                  style={{ marginLeft: '10px' }}
                  type="link"
                  icon={<FullscreenOutlined />}
                  onClick={() => setFullScreen(true)}
                />
              </Tooltip>
            </div>
          </div>
        }
        bodyStyle={{
          height: 600,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
        width="70%"
        visible={!!previewWidget?.id}
        destroyOnClose
        footer={false}
        onCancel={() => setPreviewWidget(undefined)}
        maskClosable={false}
        keyboard={false}
      >
        {(() => {
          const widgetContent =
            previewWidget?.viz_type === EVisualizationType.SQL ? (
              <SQLPreview sql={previewWidget?.specification} />
            ) : (
              previewWidget?.id && <WidgetPreview widgetId={previewWidget?.id} />
            );
          return (
            <>
              {fullScreen ? (
                <FullScreenCard
                  onClose={() => {
                    setFullScreen(false);
                  }}
                  fullScreen={true}
                >
                  {widgetContent}
                </FullScreenCard>
              ) : null}
              {widgetContent}
            </>
          );
        })()}
      </Modal>
    </div>
  );
}
