import AutoHeightContainer from '@/components/AutoHeightContainer';
import {
  createSqlJson,
  deleteSqlJson,
  downloadSqlJsonCSV,
  downloadSqlJsonExcel,
  queryAllSqlJson,
  syncSqlJsonSeq,
  updateSqlJson,
} from '@/services/sqllab';
import {
  ExportOutlined,
  FormatPainterOutlined,
  RollbackOutlined,
  SearchOutlined,
  StopOutlined,
} from '@ant-design/icons';
import {
  Button,
  Card,
  Divider,
  Dropdown,
  Form,
  Menu,
  Modal,
  Result,
  Skeleton,
  Tabs,
  TabsProps,
  message,
} from 'antd';
import { useEffect, useMemo, useRef, useState } from 'react';
import SideBar from './components/SideBar';
import { EVisualizationType, IWidgetFormData } from '@bi/common';
import DraggableTabs from '../Dashboard/components/DraggableTabs';
import EditableTitle from '@/components/EditableTitle';
import TextArea from 'antd/lib/input/TextArea';
import styles from './index.less';
import { history } from 'umi';
//@ts-ignore
import { format } from 'sql-formatter';
import SQLPreview from './components/Preview';
import { useWatch } from 'antd/lib/form/Form';
import { cancelQueryWidgetData } from '@/services';
import useEmbed from '@/hooks/useEmbed';
import CenteredCard from '@/components/CenteredCard';

function extractTableNamesFromSQL(sqlQuery: string) {
  const tableNames = [];
  const regex = /FROM\s+([^\s,\)]+)/gi;
  let match;

  while ((match = regex.exec(sqlQuery))) {
    tableNames.push(match[1]);
  }

  return tableNames[0];
}

/**
 * 删除当前url中指定参数
 * @param names 数组或字符串
 * @returns {string}
 */
function urlDelParams(names: any) {
  if (typeof names == 'string') {
    names = [names];
  }
  var loca = window.location;
  var obj = {} as any;
  var arr = loca.search.substr(1).split('&') as any;
  //获取参数转换为object
  for (var i = 0; i < arr.length; i++) {
    arr[i] = arr[i].split('=');
    obj[arr[i][0]] = arr[i][1];
  }
  //删除指定参数
  for (var i = 0; i < names.length; i++) {
    delete obj[names[i]];
  }
  //重新拼接url
  var url =
    loca.origin +
    loca.pathname +
    '?' +
    JSON.stringify(obj)
      .replace(/[\"\{\}]/g, '')
      .replace(/\:/g, '=')
      .replace(/\,/g, '&');
  window.history.replaceState(null, '', url);
}

const BI_SQL_JSON_TAB_ID = 'BI_SQL_JSON_TAB_ID';

export default function SqlLab() {
  const [form] = Form.useForm();
  const [exploreLoading, setExploreLoading] = useState<boolean>(false);
  const id = useRef('');
  const [sqlJsonList, setSqlJsonList] = useState<IWidgetFormData[]>([]);
  const [selectedSqlJson, setSelectedSqlJson] = useState<IWidgetFormData>();
  const [currentSqlJsonName, setCurrentSqlJsonName] = useState<string>('untitled');
  const sql = useWatch('sql', form);
  const sqlEmpty = !/\S/.test(sql);
  const banCreateTab = selectedSqlJson?.id === '' && sqlJsonList?.length !== 0;
  const banChangeTab = selectedSqlJson?.id === '';
  const [embed, location] = useEmbed();
  const [tabLoading, setTabLoading] = useState<boolean>(true);
  const [initTableName, setInitTableName] = useState<string>();
  const sqlPreviewRef = useRef<{ reload: any }>();

  const fetchSqlJsonList = async () => {
    setTabLoading(true);
    const { success, data } = (await queryAllSqlJson()) || {};
    setTabLoading(false);
    if (success) {
      setSqlJsonList([...data]);
      return [...data];
    }
    return [];
  };

  const saveSqlJson = async () => {
    if (!id.current) {
      const { success, data } = await createSqlJson({
        name: currentSqlJsonName,
        datasource: '-',
        viz_type: EVisualizationType.SQL,
        specification: sql,
        readonly: '0',
      });
      if (success) {
        await fetchSqlJsonList();
        id.current = data?.id!;
        setSelectedSqlJson(data);
        message.success('保存成功!');
        return success;
      }
    } else {
      const { success, data } = await updateSqlJson({
        id: id.current,
        name: currentSqlJsonName,
        datasource: '-',
        viz_type: EVisualizationType.SQL,
        specification: sql,
        readonly: '0',
      });
      if (success) {
        await fetchSqlJsonList();
        setSelectedSqlJson(data);
        message.success('保存成功!');
        return success;
      }
    }
    return false;
  };

  const handleEdit: TabsProps['onEdit'] = async (targetKey, action) => {
    if (action === 'add') {
      const createTab = () => {
        const newSqlJson = {
          id: '',
          name: 'untitled',
          datasource: '-',
          viz_type: EVisualizationType.SQL,
          specification: '',
          readonly: '0',
        };
        id.current = '';
        setSqlJsonList([...sqlJsonList, newSqlJson]);
        setSelectedSqlJson(newSqlJson);
      };
      if (banCreateTab) {
        message.info('请先保存当前SQL!');
        return;
      } else {
        createTab();
      }
    }
    if (action === 'remove') {
      Modal.confirm({
        title: '确定删除吗？',
        onOk: async () => {
          const { success } = await deleteSqlJson(targetKey as string);
          // 如果不是当前选择的，无操作
          // 如果是当前选中的，要切换当前选中的
          if (!success) {
            message.error('删除失败');
            return;
          }
          if (targetKey === selectedSqlJson?.id) {
            // 切换新的dashboard
            // 当前所在的索引位置
            let newIndex;
            const currentIndex = sqlJsonList.findIndex((el) => el.id === selectedSqlJson?.id);
            if (currentIndex - 1 >= 0) {
              // 先找前一个
              newIndex = currentIndex - 1;
            } else if (currentIndex + 1 < sqlJsonList.length) {
              // 再找后一个
              newIndex = currentIndex + 1;
            }
            if (!newIndex) {
              setSelectedSqlJson(undefined);
            } else {
              setSelectedSqlJson(sqlJsonList[newIndex]);
            }
          }
          // 最后都需要更新下新的列表
          fetchSqlJsonList();
        },
      });
    }
  };

  const handleChange: TabsProps['onChange'] = (activeKey) => {
    const changeTab = () => {
      const t = sqlJsonList?.find((s) => s.id === activeKey);
      if (t !== undefined) {
        id.current = t.id!;
        setSelectedSqlJson(t);
        localStorage.setItem(BI_SQL_JSON_TAB_ID, activeKey);
      }
    };
    if (banChangeTab) {
      message.info('请先保存当前SQL!');
      return;
    } else {
      changeTab();
    }
  };

  const handleDragEnd = (idList: string[]) => {
    // 同步tab顺序
    syncSqlJsonSeq(idList.join(','));
  };

  useEffect(() => {
    form.setFieldValue('sql', selectedSqlJson?.specification || '');
    setCurrentSqlJsonName(selectedSqlJson?.name || 'untitled');
  }, [selectedSqlJson]);

  useEffect(() => {
    (async () => {
      const createSql = location?.query?.createsql;
      if (createSql) {
        setInitTableName(extractTableNamesFromSQL(createSql));
      }
      const data = await fetchSqlJsonList();

      urlDelParams('createsql');
      if (createSql) {
        const newSqlJson = {
          id: '',
          name: 'untitled',
          datasource: '',
          viz_type: EVisualizationType.SQL,
          specification: createSql,
          readonly: '0',
        };
        setSqlJsonList([...data, newSqlJson]);
        setSelectedSqlJson(newSqlJson);
        sqlPreviewRef?.current?.reload(createSql);
        return;
      }

      const urlId = location?.query?.id;
      urlDelParams('id');
      if (urlId) {
        const t = data?.find((s) => s.id === urlId);
        if (t !== undefined) {
          id.current = t.id!;
          setSelectedSqlJson(t);
          localStorage.setItem(BI_SQL_JSON_TAB_ID, urlId);
          location.query = {};
          sqlPreviewRef?.current?.reload(t?.specification);
          return;
        }
      }

      if (data[0]) {
        setSelectedSqlJson(data[0]);
        sqlPreviewRef?.current?.reload(data[0]?.specification);
      }
    })();
  }, []);

  return (
    <CenteredCard>
      <SideBar initTableName={initTableName}>
        {(() => {
          if (tabLoading) {
            return <Skeleton />;
          }

          return (
            <>
              <DraggableTabs
                type="editable-card"
                destroyInactiveTabPane
                activeKey={selectedSqlJson?.id}
                onEdit={handleEdit}
                onChange={handleChange}
                dragEnd={handleDragEnd}
              >
                {sqlJsonList.map((row) => {
                  return (
                    <Tabs.TabPane
                      tab={
                        <EditableTitle
                          title={row.name}
                          canEdit={true}
                          onSaveTitle={setCurrentSqlJsonName}
                          showTooltip={false}
                        />
                      }
                      key={row.id}
                    ></Tabs.TabPane>
                  );
                })}
              </DraggableTabs>

              {sqlJsonList?.length > 0 ? (
                <>
                  <Form form={form}>
                    <Card
                      style={{
                        width: '100%',
                        height: '300px',
                        margin: '10px',
                        background: 'rgba(0, 0, 0, 0.05)',
                      }}
                      title={null}
                      size={'small'}
                      bodyStyle={{ width: '100%', height: '100%', padding: '10px' }}
                      bordered
                    >
                      <Form.Item name="sql" noStyle>
                        <TextArea style={{ height: 240, resize: 'none' }} />
                      </Form.Item>
                      <div
                        style={{
                          width: '100%',
                          height: '50px',
                          display: 'flex',
                          alignItems: 'center',
                        }}
                      >
                        {exploreLoading ? (
                          <Button
                            type="primary"
                            danger
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              cancelQueryWidgetData(id.current);
                              setExploreLoading(false);
                            }}
                            icon={<StopOutlined />}
                            style={{ marginRight: '10px' }}
                          >
                            取消查询
                          </Button>
                        ) : (
                          <Button
                            type="primary"
                            icon={<SearchOutlined />}
                            loading={exploreLoading}
                            disabled={sqlEmpty}
                            onClick={() => {
                              sqlPreviewRef?.current?.reload(sql);
                            }}
                          >
                            查询
                          </Button>
                        )}

                        <Button
                          style={{ marginLeft: '10px' }}
                          icon={<FormatPainterOutlined />}
                          disabled={sqlEmpty}
                          onClick={() => {
                            form.setFieldValue('sql', format(sql));
                          }}
                        >
                          格式化
                        </Button>
                        <Button
                          style={{ marginLeft: '10px' }}
                          icon={<SearchOutlined />}
                          disabled={sqlEmpty}
                          onClick={saveSqlJson}
                        >
                          保存
                        </Button>
                        <Divider type="vertical" />
                        <Dropdown
                          overlay={
                            <Menu>
                              <Menu.Item
                                key={'csv'}
                                onClick={() => {
                                  downloadSqlJsonCSV(sql);
                                }}
                              >
                                导出 CSV 文件
                              </Menu.Item>
                              <Menu.Item
                                key={'excel'}
                                onClick={() => {
                                  downloadSqlJsonExcel(sql);
                                }}
                              >
                                导出 Excel 文件
                              </Menu.Item>
                            </Menu>
                          }
                          disabled={sqlEmpty}
                          trigger={['click']}
                        >
                          <Button disabled={sqlEmpty} type="primary" icon={<ExportOutlined />}>
                            导出
                          </Button>
                        </Dropdown>
                        <Button
                          style={{ marginLeft: '10px' }}
                          icon={<RollbackOutlined />}
                          onClick={() => {
                            if (embed) {
                              history.push('/embed/widget');
                            } else {
                              history.push('/widget');
                            }
                          }}
                        >
                          返回
                        </Button>
                      </div>
                    </Card>
                    <AutoHeightContainer contentStyle={{ overflowY: 'auto' }} autoHeight={true}>
                      <SQLPreview
                        initId={id.current}
                        ref={sqlPreviewRef}
                        setLoading={setExploreLoading}
                      />
                    </AutoHeightContainer>
                  </Form>
                </>
              ) : (
                <Result status="info" title="请创建SQL!" />
              )}
            </>
          );
        })()}
      </SideBar>
    </CenteredCard>
  );
}
