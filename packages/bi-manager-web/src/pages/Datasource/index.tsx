import { proTableSerchConfig } from '@/common';
import { GlobalContext, IGlobalContext } from '@/layouts/GlobalLayout';
import { queryDatasourcesColumns } from '@/services/dataset';
import { deleteDictMapping, queryDictMappings } from '@/services/dicts';
import { BookOutlined, PlusOutlined } from '@ant-design/icons';
import ProTable, { ActionType, ProColumns } from '@ant-design/pro-table';
import { IClickhouseColumn, IDictMapping } from '@bi/common';
import { Card, message, Modal, Popover, Select, Skeleton, Table, Tag } from 'antd';
import { useContext, useEffect, useRef, useState } from 'react';
import { history } from 'umi';
import styles from './index.less';
import useEmbed from '@/hooks/useEmbed';
import useVariable from 'use-variable-hook';
import TagEditDrawer, { dictMapColumns, TagEditDrawerRef } from './components/TagEditDrawer';
import useDatabases from '@/hooks/useDatabases';
import useDatasources from '@/hooks/useDatasource';

type DatasourceVariables = {
  selectedDatabase: string;
  selectedTable: string;
  dictMappings: IDictMapping[];
};

export default function Datasource() {
  const [embed, location] = useEmbed();
  const actionRef = useRef<ActionType>();
  const drawerRef = useRef<TagEditDrawerRef>();
  const { dicts = [] } = useContext<IGlobalContext>(GlobalContext);
  const [databases] = useDatabases();
  const [variables, dispatch] = useVariable<DatasourceVariables>({
    variables: {
      selectedDatabase: undefined,
      selectedTable: undefined,
      dictMappings: [],
    },
    effects: {
      fetchDictMappings({ call }, { store }) {
        if (!store.selectedTable) {
          return;
        }
        const { success, data } = call(queryDictMappings, store.selectedTable);
        if (success) {
          store.dictMappings = data;
        }
      },
    },
  });
  const [datasources] = useDatasources(variables.selectedDatabase);
  // 更新 uri
  useEffect(() => {
    history.replace({
      pathname: location.pathname,
      query: {
        table: variables.selectedTable,
      },
    });
  }, [location.pathname, variables.selectedTable]);

  // 初始化
  useEffect(() => {
    if (!variables.selectedDatabase && databases?.length > 0) {
      variables.selectedDatabase = databases[0].id!;
    }

    if (datasources?.length > 0) {
      variables.selectedTable = datasources[0].name!;
      actionRef.current?.reload();
    }
  }, [databases, datasources]);

  //获取映射关系
  useEffect(() => {
    if (datasources.length > 0) {
      dispatch({ type: 'fetchDictMappings' });
    }
  }, [variables.selectedTable]);

  const columns: ProColumns<IClickhouseColumn>[] = [
    {
      title: '字段名称',
      dataIndex: 'name',
      align: 'left',
      search: false,
    },
    {
      title: '字段类型',
      dataIndex: 'type',
      align: 'left',
      search: false,
    },
    {
      title: '字段说明',
      dataIndex: 'comment',
      align: 'left',
      search: false,
    },
    {
      title: '字典',
      align: 'left',
      search: false,
      render: (_, record) => {
        const tagDictInfo = dicts.find((dict) => dict.id === record.dict_field) as any;
        if (tagDictInfo) {
          return (
            <>
              <Popover
                key={tagDictInfo?.dict_field}
                placement="right"
                content={
                  <div style={{ minWidth: '400px' }}>
                    <Table
                      size="small"
                      bordered
                      columns={dictMapColumns}
                      dataSource={Object.keys(tagDictInfo?.dict).map((key) => {
                        return { key, value: tagDictInfo?.dict[key] };
                      })}
                    />
                  </div>
                }
                title={`字典: ${tagDictInfo?.name}`}
              >
                <Tag
                  style={{
                    cursor: !embed ? 'pointer' : '',
                  }}
                  color="processing"
                  onClick={() => {
                    if (!embed) {
                      drawerRef.current?.update(
                        variables.selectedTable,
                        record.name,
                        record.dict_field!,
                        tagDictInfo.id,
                      );
                    }
                  }}
                  onClose={async (e) => {
                    e.preventDefault();
                    Modal.confirm({
                      title: '确定删除吗？',
                      onOk: async () => {
                        const { id } =
                          variables.dictMappings.find(
                            (mapping) => mapping.table_field === record.name,
                          ) || {};
                        if (id) {
                          const { success } = await deleteDictMapping(id);
                          if (!success) {
                            message.error('删除失败!');
                          } else {
                            message.success('删除成功');
                          }
                          actionRef.current?.reload();
                        }
                      },
                    });
                  }}
                  closable={!embed}
                >
                  <BookOutlined style={{ marginRight: '10px' }} />
                  {tagDictInfo?.name || tagDictInfo?.dict_field}
                </Tag>
              </Popover>
            </>
          );
        }
        return (
          <>
            {!embed ? (
              <Tag
                style={{
                  cursor: 'pointer',
                  background: '#fff',
                  borderStyle: 'dashed',
                }}
                onClick={() => {
                  drawerRef.current?.create(variables.selectedTable, record.name);
                }}
              >
                <PlusOutlined />
                添加字典
              </Tag>
            ) : (
              ''
            )}
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
      <div style={{ margin: '10px' }} className={styles['pro-table-auto-height']}>
        <ProTable<IClickhouseColumn>
          rowKey={(row) => `${variables.selectedTable}__${row.name}__${row.type}`}
          bordered
          size="small"
          columns={columns}
          request={async () => {
            if (datasources.length <= 0 || !variables.selectedTable) {
              return {
                data: [],
                success: false,
              };
            }
            const { success, data } = await queryDatasourcesColumns(
              variables.selectedDatabase,
              variables.selectedTable,
            );
            return {
              data: success ? [...data] : [],
              success,
            };
          }}
          pagination={false}
          search={{
            ...proTableSerchConfig,
            span: 12,
            optionRender: () => [
              <span>数据库:</span>,
              <Select
                onChange={(value) => {
                  variables.selectedDatabase = value;
                }}
                style={{ width: '200px', textAlign: 'left', marginRight: '0px' }}
                showSearch
                optionFilterProp="label"
                value={variables.selectedDatabase}
                placeholder="请选择数据库"
                allowClear
              >
                {databases.map((item) => {
                  return (
                    <Select.Option key={item.id} value={item.id} label={item.name}>
                      {item.name}
                    </Select.Option>
                  );
                })}
              </Select>,
              <Select
                onChange={(value) => {
                  variables.selectedTable = value;
                  actionRef.current?.reload();
                }}
                disabled={!variables.selectedDatabase}
                style={{ width: '200px', textAlign: 'left', marginRight: '0px' }}
                showSearch
                optionFilterProp="label"
                value={variables.selectedTable}
                placeholder="请选择数据源"
                allowClear
              >
                {datasources.map((item) => {
                  const value = item.name!;
                  return (
                    <Select.Option key={value} value={value} label={item.comment! || value}>
                      {item.comment! || value}
                    </Select.Option>
                  );
                })}
              </Select>,
            ],
          }}
          toolBarRender={false}
          actionRef={actionRef}
        />
        <TagEditDrawer
          ref={drawerRef}
          onSuccess={() => {
            dispatch({ type: 'fetchDictMappings' });
            actionRef.current?.reload();
          }}
          dicts={dicts}
        />
      </div>
    </Card>
  );
}
