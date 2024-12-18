import { DataBaseParsedType } from '@bi/common';
import { Badge, Button, Descriptions, message, Popconfirm, Popover } from 'antd';
import { useEffect, useRef, useState } from 'react';
import { Table } from 'antd';
import { deleteDatabase, queryDatabases } from '@/services/database';
import CreateButton from './components/CreateButton';
import { ColumnType } from 'antd/lib/table';

const renderDesc = (obj: Record<string, any>) => {
  return (
    <Popover
      content={
        <Descriptions
          bordered
          size="small"
          column={2}
          style={{ maxHeight: '300px', marginTop: '10px', maxWidth: '600px' }}
        >
          {Object.keys(obj || {})
            .filter((k) => typeof (obj || {})[k] !== 'object')
            .map((k) => {
              if (typeof (obj || {})[k] === 'object') {
                return <></>;
              }
              return (
                <Descriptions.Item
                  style={{
                    textOverflow: 'ellipsis',
                    overflow: 'hidden',
                  }}
                  label={k}
                >
                  <div
                    style={{
                      maxWidth: '150px',
                      maxHeight: '100px',
                      textOverflow: 'ellipsis',
                      overflow: 'auto',
                    }}
                  >
                    {(obj || {})[k]}
                  </div>
                </Descriptions.Item>
              );
            })}
        </Descriptions>
      }
      trigger="click"
    >
      <Button type="link">[点击查看详情]</Button>
    </Popover>
  );
};

export default function WidgetList() {
  const [loading, setLoading] = useState<boolean>(true);
  const [tableData, setTableData] = useState<DataBaseParsedType[]>([]);

  const columns: ColumnType<DataBaseParsedType>[] = [
    {
      title: '名称',
      dataIndex: 'name',
      align: 'center',
    },
    {
      title: '类型',
      dataIndex: 'type',
      align: 'center',
    },
    {
      title: 'HOST地址',
      dataIndex: 'host',
      align: 'center',
      render: (_, record) => {
        return (record.option as any)?.host;
      },
    },
    {
      title: '端口',
      dataIndex: 'port',
      align: 'center',
      render: (_, record) => {
        return (record.option as any)?.port;
      },
    },
    {
      title: '数据库',
      dataIndex: 'database',
      align: 'center',
      render: (_, record) => {
        return (record.option as any)?.database;
      },
    },
    {
      title: '配置详情',
      dataIndex: 'option',
      width: 150,
      align: 'center',
      render: (_, record) => {
        return renderDesc(record.option);
      },
    },
    {
      title: '连接状态',
      dataIndex: 'state',
      width: 150,
      align: 'center',
      render: (state) => {
        return state ? (
          <Badge status="success" text="连接成功" />
        ) : (
          <Badge status="error" text="连接失败" />
        );
      },
    },
    {
      title: '操作',
      width: 150,
      align: 'center',
      dataIndex: 'action',
      render: (text, record) => {
        return (
          <>
            <Button
              type="link"
              size="small"
              onClick={() => {
                ref.current.copy(record.id);
              }}
            >
              拷贝
            </Button>
            <Button
              type="link"
              size="small"
              onClick={() => {
                ref.current.update(record.id);
              }}
            >
              {record?.readonly === '1' ? '查看' : '修改'}
            </Button>
            <Popconfirm
              title="确定删除吗？"
              disabled={record?.readonly === '1'}
              onConfirm={async () => {
                const { success } = await deleteDatabase(record.id || '');
                if (success) {
                  message.success('删除成功');
                  fetchDatabases();
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
  const ref = useRef<any>();
  const fetchDatabases = async () => {
    setLoading(true);
    const { success, data } = await queryDatabases();
    if (success) {
      setTableData(
        data.map((item) => ({
          ...item,
          option: JSON.parse(item.option || '{}'),
        })),
      );
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDatabases();
  }, []);

  return (
    <>
      <style>
        {`
        .default-row{
          background-color: rgba(0,0,0,.1) !important;
        }
      `}
      </style>
      <div style={{ display: 'flex', justifyContent: 'end', padding: '10px' }}>
        <CreateButton ref={ref} updater={fetchDatabases} />
      </div>
      <Table
        rowKey="id"
        size="small"
        bordered
        style={{ margin: '0px 10px' }}
        columns={columns}
        rowClassName={(record) => {
          if (record.readonly === '1') {
            return 'default-row';
          }
          return '';
        }}
        loading={loading}
        dataSource={tableData}
        pagination={false}
      />
    </>
  );
}
