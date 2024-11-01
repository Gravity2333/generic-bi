import AutoHeightContainer from '@/components/AutoHeightContainer';
import { IGridLayoutItem } from '@/components/GridLayout/typings';
import { Card, Tabs } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import ReactGridLayout from '@/components/GridLayout';
import { v4 as uuidv4 } from 'uuid';
import styles from './index.less';
import EditableTitle from '@/components/EditableTitle';

const { TabPane } = Tabs;
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
}

export default function ({
  layoutItemId,
  layouts,
  onLayoutChange,
  texts,
  readonly,
}: IComponentTabProps) {
  const [activeKey, setActiveKey] = useState<string>('');
  const [panes, setPanes] = useState<ITabPane[]>([]);

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

  const [tabLayouts, setTabLayouts] = useState<ITabGridLayoutItem[]>([]);

  useEffect(() => {
    if (layouts && layoutIndex >= 0 && texts) {
      const { panes, tabLayouts } = texts?.get(layouts[layoutIndex].i) || {};
      setPanes(panes || []);
      setTabLayouts(tabLayouts || []);
      setTimeout(() => {
        if (panes) {
          setActiveKey(panes[0]?.key);
        }
      });
    }
  }, []);

  useEffect(() => {
    if (panes && panes.length <= 0) {
      return;
    }
    const copyLayouts = [...layouts];
    copyLayouts[layoutIndex] = {
      ...copyLayouts[layoutIndex],
    } as any;
    texts?.set(copyLayouts[layoutIndex].i, { panes, tabLayouts });
    onLayoutChange && onLayoutChange(copyLayouts);
  }, [panes, tabLayouts]);

  return (
    <Card style={{ width: '100%', height: '100%' }}>
      <Tabs
        type={readonly ? 'card' : 'editable-card'}
        onChange={(activeKey) => {
          setActiveKey(activeKey);
        }}
        size="small"
        activeKey={activeKey}
        onEdit={(e) => {
          if (typeof e === 'string') {
            setPanes(panes.filter((pane) => pane.key !== e));
          } else {
            const key = uuidv4();
            setPanes([
              ...panes,
              {
                title: '标签页',
                key: key,
                closable: true,
                content: '',
              },
            ]);
            setActiveKey(key);
          }
        }}
      >
        {panes &&
          panes.map((pane) => {
            let index = -1;
            for (let i = 0; i < panes.length; i++) {
              if (panes[i].key === pane.key) {
                index = i;
                break;
              }
            }
            return (
              <TabPane
                tab={
                  <EditableTitle
                    title={pane.title}
                    canEdit={!readonly}
                    onSaveTitle={(e) => {
                      if (readonly) {
                        return;
                      }
                      if (index < 0) {
                        return;
                      }
                      const list = [...panes];
                      list[index] = {
                        ...list[index],
                        title: e,
                      };
                      setPanes(list);
                    }}
                    showTooltip={false}
                  />
                }
                key={pane.key}
                closable={readonly ? false : pane.closable}
              >
                <div
                  onDragEnter={(e) => {
                    e.stopPropagation();
                  }}
                >
                  <div className={styles['dashboard-editor']}>
                    <div className={styles['dashboard-content']}>
                      <div>
                        {/* @ts-ignore */}
                        <ReactGridLayout
                          initLayouts={tabLayouts.filter((l) => l.page === pane.key)}
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
                    </div>
                  </div>
                </div>
              </TabPane>
            );
          })}
      </Tabs>
    </Card>
  );
}
