import { proTableSerchConfig } from '@/common';
import { GlobalContext, IGlobalContext } from '@/layouts/GlobalLayout';
import { queryClichhouseTableColumns } from '@/services/dataset';
import { deleteDictMapping, queryDictMappings } from '@/services/dicts';
import { BookOutlined, PlusOutlined } from '@ant-design/icons';
import ProTable, { ActionType, ProColumns } from '@ant-design/pro-table';
import { IClickhouseColumn, IDictMapping } from '@bi/common';
import { message, Modal, Popover, Select, Skeleton, Table, Tag } from 'antd';
import { useContext, useEffect, useRef, useState } from 'react';
import { history } from 'umi';
import styles from './index.less';
import useEmbed from '@/hooks/useEmbed';
import useVariable from 'use-variable-hook';
import TagEditDrawer, { dictMapColumns, TagEditDrawerRef } from './components/TagEditDrawer';

type DatasourceVariables = {
  selectedTable: string;
  dictMappings: IDictMapping[];
};

export default function Datasource() {
  const [embed, location] = useEmbed();
  const actionRef = useRef<ActionType>();
  const drawerRef = useRef<TagEditDrawerRef>();
  const {
    datasets: tables = [],
    datasetsLoading = false,
    dicts = [],
  } = useContext<IGlobalContext>(GlobalContext);

  const [variables, dispatch] = useVariable<DatasourceVariables>({
    variables: {
      selectedTable: location.query.database,
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

  // 更新 uri
  useEffect(() => {
    history.replace({
      pathname: location.pathname,
      query: {
        table: variables.selectedTable || '',
      },
    });
  }, [location.pathname, variables.selectedTable]);

  // 初始化
  useEffect(() => {
    if (!variables.selectedTable) {
      variables.selectedTable = tables?.length > 0 ? tables[0].name : '';
    }
  }, [tables]);

  //获取映射关系
  useEffect(() => {
    if (tables.length > 0) {
      dispatch({ type: 'fetchDictMappings' });
    }
  }, [variables.selectedTable]);

  const columns: ProColumns<IClickhouseColumn>[] = [
    {
      title: '表名',
      dataIndex: 'table',
      align: 'left',
      hideInTable: true,
      // @ts-ignore
      search: true,
      renderFormItem: () => {
        return (
          <Select
            onChange={(value) => {
              variables.selectedTable = value;
              actionRef?.current?.reload();
            }}
            showSearch
            optionFilterProp="label"
            value={variables.selectedTable}
          >
            {tables.map((item) => {
              const value = item.name!;
              return (
                <Select.Option key={value} value={value} label={item.comment! || value}>
                  {item.comment! || value}
                </Select.Option>
              );
            })}
          </Select>
        );
      },
    },
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

  if (datasetsLoading) {
    return <Skeleton active />;
  }

  return (
    <div style={{ margin: '10px' }} className={styles['pro-table-auto-height']}>
      <ProTable<IClickhouseColumn>
        rowKey={(row) => `${variables.selectedTable}__${row.name}__${row.type}`}
        bordered
        size="small"
        columns={columns}
        request={async () => {
          if (tables.length <= 0 || !variables.selectedTable) {
            return {
              data: [],
              success: false,
            };
          }
          const { success, data } = await queryClichhouseTableColumns(variables.selectedTable);
          return {
            data: success ? [...data] : [],
            success,
          };
        }}
        pagination={false}
        search={{
          ...proTableSerchConfig,
          span: 12,
          optionRender: () => [],
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
  );
}
