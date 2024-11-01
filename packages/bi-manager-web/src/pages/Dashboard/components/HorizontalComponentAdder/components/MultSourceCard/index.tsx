import AutoHeightContainer from '@/components/AutoHeightContainer';
import { IGridLayoutItem } from '@/components/GridLayout/typings';
import { Badge, Button, Card, Divider, Popover, Select, Space } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import ReactGridLayout from '@/components/GridLayout';
import { v4 as uuidv4 } from 'uuid';
import styles from './index.less';
import EditableTitle from '@/components/EditableTitle';
import {
  CloseOutlined,
  DownSquareOutlined,
  PlusOutlined,
  SelectOutlined,
  TableOutlined,
} from '@ant-design/icons';

const { Option } = Select;

interface IComponentTabProps {
  layoutItemId: string;
  layouts: ReactGridLayout.Layout[];
  /** Dashboard 布局变化回调接口 */
  onLayoutChange?: (allLayouts: IGridLayoutItem[]) => void;
  /** 只读预览状态 */
  readonly?: boolean;
  texts: Map<string, any>;
}

interface ITabPane {
  title: string;
  content: string;
  closable: boolean;
  key: string;
}

interface ITabGridLayoutItem extends IGridLayoutItem {
  page?: string;
  tableObj?: Record<string, any>;
}

const DEFAULT_CARD_NAME = '[未命名卡片]';
export default function ({
  layoutItemId,
  layouts,
  onLayoutChange,
  texts,
  readonly,
}: IComponentTabProps) {
  const [activeKey, setActiveKey] = useState<string>('');
  const [panes, setPanes] = useState<ITabPane[]>([]);
  const [tabLayouts, setTabLayouts] = useState<ITabGridLayoutItem[]>([]);
  const [tableLayouts, setTableLayouts] = useState<ITabGridLayoutItem[]>([]);
  const [name, setName] = useState<string>(DEFAULT_CARD_NAME);
  const [showSelect, setShowSelect] = useState<boolean>(true);
  const [showTable, setShowTable] = useState<boolean>(true);
  const [tableMode, setTableMode] = useState<boolean>(false);
  const layoutIndex = useMemo(() => {
    if (layouts) {
      for (let i = 0; i < layouts.length; i++) {
        if (layouts[i].i === layoutItemId) {
          return i;
        }
      }
    }
    return -1;
  }, [layouts, layoutItemId]);

  useEffect(() => {
    if (layouts && layoutIndex >= 0 && texts) {
      const { panes, tabLayouts, tableLayouts, name, showSelect, showTable } =
        texts?.get(layouts[layoutIndex].i) || {};
      setPanes(panes || []);
      setName(name !== undefined ? name : DEFAULT_CARD_NAME);
      setShowSelect(showSelect !== undefined ? showSelect : true);
      setShowTable(showTable !== undefined ? showTable : true);
      setTabLayouts(tabLayouts || []);
      setTableLayouts(tableLayouts || []);
      setTimeout(() => {
        if (panes) {
          setActiveKey(panes[0]?.key);
        }
      });
    }
  }, []);

  useEffect(() => {
    if (panes && panes.length < 0) {
      return;
    }
    const copyLayouts = [...layouts];
    copyLayouts[layoutIndex] = {
      ...copyLayouts[layoutIndex],
    } as any;
    texts?.set(copyLayouts[layoutIndex].i, {
      panes,
      tabLayouts,
      name,
      showSelect,
      showTable,
      tableLayouts,
    });
    onLayoutChange && onLayoutChange(copyLayouts);
  }, [panes, tabLayouts, name, showSelect, showTable, tableLayouts]);

  /** 修改pane名称 */
  const changePaneTitle = (key: string, title: string) => {
    const index = panes.findIndex((pane) => pane?.key === key);
    if (index > -1) {
      const newPane = [...panes];
      newPane.splice(index, 1, {
        ...panes[index],
        title,
      });
      setPanes(newPane);
    }
  };

  /** 创建新pane */
  const createNewPane = () => {
    const key = uuidv4();
    setPanes((panes) =>
      panes.concat({
        title: '[未命名数据源]',
        key,
        closable: true,
        content: '',
      }),
    );
    setActiveKey(key);
  };

  /** 删除pane */
  const deletePane = (key: string) => {
    setPanes((panes) =>
      panes.filter((p) => {
        return p.key !== key;
      }),
    );
    setTabLayouts(tabLayouts.filter((l) => l.page !== key));
    if (activeKey === key) {
      setActiveKey('');
    }
  };

  const rendContent = () => {
    const pane = panes.find((p) => p.key === activeKey);
    if (pane) {
      const tabLayout = tabLayouts.filter((l) => l.page === pane.key);
      const tableLayout = tableLayouts.filter((l) => l.page === pane.key);
      return (
        <div
          onDragEnter={(e) => {
            e.stopPropagation();
          }}
        >
          <div className={styles['dashboard-editor']}>
            <div className={styles['dashboard-content']}>
              {tableMode ? (
                <div
                  className={styles['dashboard-grid']}
                  style={{ overflowY: 'auto', height: '100%', width: '100%' }}
                >
                  {/* @ts-ignore */}
                  <ReactGridLayout
                    key={`table-${activeKey}`}
                    initLayouts={tableLayout}
                    texts={texts}
                    onLayoutChange={(e: any[]) => {
                      /** 闭包问题，需要用自执行函数包裹 */
                      ((pageKey: string) => {
                        let newLayouts: ITabGridLayoutItem[] = [...tableLayouts];
                        for (let i = 0; i < e.length; i++) {
                          const target = tableLayouts.find((l) => l.i === e[i].i);
                          if (target === undefined) {
                            newLayouts = [
                              ...newLayouts,
                              {
                                ...e[i],
                                page: pageKey,
                              },
                            ];
                          } else {
                            const targetIndex = tableLayouts.findIndex((l) => l.i === e[i].i);
                            if (targetIndex >= 0) {
                              newLayouts[targetIndex] = {
                                ...e[i],
                                page: pageKey,
                              };
                            }
                          }
                        }
                        setTableLayouts([
                          ...newLayouts.filter((layout) => {
                            if (layout.page !== pageKey) {
                              return true;
                            }
                            return e.find((l) => layout.i === l.i);
                          }),
                        ]);
                      })(pane.key);
                    }}
                    readonly={readonly}
                  />
                </div>
              ) : (
                <div
                  className={styles['dashboard-grid']}
                  style={{ overflowY: 'auto', height: '100%', width: '100%' }}
                >
                  {/* @ts-ignore */}
                  <ReactGridLayout
                    key={`tab-${activeKey}`}
                    initLayouts={tabLayout}
                    texts={texts}
                    onLayoutChange={(e: any[]) => {
                      /** 闭包问题，需要用自执行函数包裹 */
                      ((pageKey: string) => {
                        let newLayouts: ITabGridLayoutItem[] = [...tabLayouts];
                        for (let i = 0; i < e.length; i++) {
                          const target = tabLayouts.find((l) => l.i === e[i].i);
                          if (target === undefined) {
                            newLayouts = [
                              ...newLayouts,
                              {
                                ...e[i],
                                page: pageKey,
                              },
                            ];
                          } else {
                            const targetIndex = tabLayouts.findIndex((l) => l.i === e[i].i);
                            if (targetIndex >= 0) {
                              newLayouts[targetIndex] = {
                                ...e[i],
                                page: pageKey,
                              };
                            }
                          }
                        }
                        setTabLayouts([
                          ...newLayouts.filter((layout) => {
                            if (layout.page !== pageKey) {
                              return true;
                            }
                            return e.find((l) => layout.i === l.i);
                          }),
                        ]);
                      })(pane.key);
                    }}
                    readonly={readonly}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }
    return '';
  };

  const rendeSourceSelect = () => {
    const select = (
      <Select
        style={{ width: '150px' }}
        value={activeKey}
        showArrow={false}
        onChange={(val) => setActiveKey(val)}
        dropdownRender={(menu) => (
          <>
            {menu}
            {!readonly ? (
              <>
                <Divider style={{ margin: '0px 0' }} />
                <Button
                  type="text"
                  style={{ width: '100%' }}
                  icon={<PlusOutlined />}
                  onClick={createNewPane}
                >
                  增加数据源
                </Button>
              </>
            ) : null}
          </>
        )}
      >
        {panes?.map((pane) => {
          const { key, title } = pane;
          return (
            <Option key={key} value={key}>
              <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between' }}>
                <EditableTitle
                  onClick={(e) => {
                    if (!readonly) {
                      e.stopPropagation();
                    }
                  }}
                  title={title}
                  canEdit={!readonly}
                  onSaveTitle={(e) => {
                    if (readonly) {
                      return;
                    }
                    changePaneTitle(key, e);
                  }}
                  showTooltip={false}
                />
                {!readonly ? (
                  <CloseOutlined
                    style={{ lineHeight: '30px', fontSize: '10px' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      deletePane(key);
                    }}
                  />
                ) : null}
              </div>
            </Option>
          );
        })}
      </Select>
    );
    if (readonly && showSelect) {
      return select;
    } else if (showSelect) {
      return (
        <Badge
          count={
            <div
              style={{
                fontSize: '13px',
                lineHeight: '13px',
                textAlign: 'center',
                cursor: 'pointer',
              }}
            >
              <Popover content="隐藏选择框" trigger="hover">
                <DownSquareOutlined
                  onClick={() => {
                    setShowSelect(false);
                  }}
                />
              </Popover>
            </div>
          }
        >
          {select}
        </Badge>
      );
    } else if (!showSelect && !readonly) {
      return (
        <Popover content="打开选择框" trigger="hover">
          <SelectOutlined
            style={{
              fontSize: '13px',
              cursor: 'pointer',
            }}
            onClick={() => {
              setShowSelect(true);
            }}
          />
        </Popover>
      );
    }
  };

  const renderTableSwitch = () => {
    const tableIcon = (
      <TableOutlined
        style={{ fontSize: '20px', color: tableMode ? 'rgb(25, 140, 225)' : '' }}
        onClick={() => {
          setTableMode(!tableMode);
        }}
      />
    );
    if (readonly && showTable) {
      return (
        <Popover content={tableMode ? '关闭表格预览' : '打开表格阅览'} trigger="hover">
          {tableIcon}
        </Popover>
      );
    } else if (showTable) {
      return (
        <Badge
          count={
            <div
              style={{
                fontSize: '13px',
                lineHeight: '13px',
                textAlign: 'center',
                cursor: 'pointer',
              }}
            >
              <Popover content="关闭表格阅览模式" trigger="hover">
                <DownSquareOutlined
                  onClick={() => {
                    setShowTable(false);
                  }}
                />
              </Popover>
            </div>
          }
        >
          {tableIcon}
        </Badge>
      );
    } else if (!showTable && !readonly) {
      return (
        <Popover content="打开表格阅览模式" trigger="hover">
          <TableOutlined
            style={{
              fontSize: '13px',
              cursor: 'pointer',
            }}
            onClick={() => {
              setShowTable(true);
            }}
          />
        </Popover>
      );
    }
    return;
  };

  return (
    <Card
      title={
        <EditableTitle
          title={name}
          canEdit={!readonly}
          onSaveTitle={(e) => {
            if (readonly) {
              return;
            }
            setName(e);
          }}
          showTooltip={false}
        />
      }
      extra={
        <div style={{ marginRight: readonly ? '0px' : '40px' }}>
          <Space size={20}>
            {rendeSourceSelect()}
            {renderTableSwitch()}
          </Space>
        </div>
      }
      size="small"
      style={{ width: '100%', height: '100%' }}
    >
      {rendContent()}
    </Card>
  );
}
