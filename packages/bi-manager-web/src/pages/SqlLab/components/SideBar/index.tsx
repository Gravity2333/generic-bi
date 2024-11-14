import storage from '@/utils/storage';
import { useEffect, useMemo, useState } from 'react';
export const SEARCH_TREE_COLLAPSED_KEY = 'search-tree-collapsed';
import styles from './index.less';
import ProTable, { ProColumns } from '@ant-design/pro-table';
import { IClickhouseColumn } from '@bi/common';
import { Affix, Button, Card, Select, Tooltip, message } from 'antd';
import classNames from 'classnames';
import { DoubleRightOutlined, LeftSquareOutlined } from '@ant-design/icons';
import AutoHeightContainer from '@/components/AutoHeightContainer';
import CopyToClipboard from 'react-copy-to-clipboard';
import useSource from '@/hooks/useSource';
import React from 'react';

const datasourceColumns: ProColumns<IClickhouseColumn>[] = [
  {
    title: '字段名称',
    dataIndex: 'name',
    align: 'center',
    search: false,
    ellipsis: true,
    width: 100,
    render: (_, record) => {
      return (
        <CopyToClipboard
          text={record?.name}
          onCopy={(_, success: boolean) => {
            if (success) {
              message.success('复制成功');
            } else {
              message.error('复制失败');
            }
          }}
        >
          <Button type="link" size="small">
            {record?.name}
          </Button>
        </CopyToClipboard>
      );
    },
  },
  {
    title: '字段类型',
    dataIndex: 'type',
    align: 'center',
    search: false,
    ellipsis: true,
    width: 100,
  },
  {
    title: '字段说明',
    dataIndex: 'comment',
    align: 'center',
    search: false,
    ellipsis: true,
    width: 100,
  },
];

const SideBar = ({ children, initTableName }: any) => {
  const [collapsed, setCollapsed] = useState<boolean>(
    () => storage.get(SEARCH_TREE_COLLAPSED_KEY) === 'true',
  );

  const [selectedTable, setSelectedTable] = useState<string>('');
  const [selectedDatabase, setSelectedDatabase] = useState<string>('');

  const { databases, datasources, columns: currentColums, selectDB, selectTb } = useSource();

  /** 数据源列表 */
  const databaseList = useMemo(() => {
    return (
      databases.map((item: any) => ({
        id: item.id,
        title: item.name,
      })) || []
    );
  }, [databases]);

  const tables = useMemo(() => {
    return (
      datasources.map((item: any) => ({
        id: item.name,
        title: item.comment || item.name,
      })) || []
    );
  }, [datasources]);

  const handleCollapsed = (nextCollapsed: boolean) => {
    setCollapsed(nextCollapsed);
    storage.put(SEARCH_TREE_COLLAPSED_KEY, nextCollapsed);
  };

  useEffect(() => {
    selectTb(selectedTable);
  }, [selectedTable]);

  useEffect(() => {
    selectDB(selectedDatabase);
  }, [selectedDatabase]);

  useEffect(() => {
    setSelectedTable(tables[0]?.id);
  }, [tables]);

  useEffect(() => {
    if (initTableName) {
      setSelectedTable(initTableName);
    }
  }, [initTableName]);

  useEffect(()=>{
    if(databases?.length > 0 ){
      setSelectedDatabase(databases[0]?.id!)
    }
  },[databases])

  return (
    <div className={classNames([styles.layoutWrap, collapsed && styles.collapsed])}>
      <div className={styles.leftWrap}>
        {collapsed ? (
          <Affix key="miniBar" offsetTop={10}>
            <div
              onClick={() => {
                handleCollapsed(!collapsed);
              }}
              className={styles.miniBar}
            >
              <Tooltip title="展开" placement="right">
                <div className={styles.barWrap}>
                  <DoubleRightOutlined />
                </div>
              </Tooltip>
            </div>
          </Affix>
        ) : (
          <Affix key="minibarwrap" offsetTop={10}>
            <div className={styles.searchTreeWrap}>
              <Card bodyStyle={{ padding: 6 }}>
                <Button
                  block
                  type="primary"
                  icon={<LeftSquareOutlined />}
                  className={styles.collapsedBtn}
                  onClick={() => {
                    handleCollapsed(!collapsed);
                  }}
                >
                  收起
                </Button>
                <AutoHeightContainer contentStyle={{ overflow: 'auto' }}>
                  <Select
                    style={{ width: '90%', margin: '15px 15px' }}
                    showSearch
                    value={selectedDatabase}
                    optionFilterProp="label"
                    placeholder="数据库"
                    onChange={(value) => {
                      setSelectedDatabase(value);
                    }}
                  >
                    {databaseList.length &&
                      databaseList.map((item: any) => (
                        <Select.Option key={item.id} value={item.id} label={item.title}>
                          {item.title}
                        </Select.Option>
                      ))}
                  </Select>
                  <Select
                    style={{ width: '90%', margin: '15px 15px' }}
                    onChange={(value) => {
                      setSelectedTable(value);
                    }}
                    showSearch
                    optionFilterProp="label"
                    placeholder="数据源"
                    value={selectedTable}
                  >
                    {tables.map((item) => {
                      const value = item.id!;
                      return (
                        <Select.Option key={value} value={value} label={item.title}>
                          {item.title! || value}
                        </Select.Option>
                      );
                    })}
                  </Select>
                  <h4 style={{ marginLeft: '15px' }}>
                    表名称:
                    <CopyToClipboard
                      text={selectedTable}
                      onCopy={(_, success: boolean) => {
                        if (success) {
                          message.success('复制成功');
                        } else {
                          message.error('复制失败');
                        }
                      }}
                    >
                      <Button type="link" size="small">
                        {selectedTable}
                      </Button>
                    </CopyToClipboard>
                  </h4>

                  <ProTable<IClickhouseColumn>
                    style={{ margin: '10px' }}
                    rowKey={(row) => `${selectedTable}__${row.name}__${row.type}`}
                    bordered
                    key={'1'}
                    size="small"
                    columns={datasourceColumns}
                    dataSource={currentColums}
                    pagination={false}
                    search={false}
                    toolBarRender={false}
                  />
                </AutoHeightContainer>
              </Card>
            </div>
          </Affix>
        )}
      </div>
      <div className={styles.contentWrap}>
        {React.Children.map(children, (child) => React.cloneElement(child, { databaseList }))}
      </div>
    </div>
  );
};

export default SideBar;
