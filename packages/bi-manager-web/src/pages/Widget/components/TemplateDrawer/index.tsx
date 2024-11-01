
import { Button, Card, Drawer } from 'antd';
import React, { useCallback, useEffect, useImperativeHandle, useState } from 'react';
import HIDE_SVG from './assets/hide.svg';
import styles from './index.less';
import { queryAllTemplateWidgets } from '@/services';
import {
  CHART_TYPE_MAP,
  EVisualizationType,
  IWidgetFormData,
  IWidgetSpecification,
  parseObjJson,
} from '@bi/common';
import { throttle } from '@/utils';
import DemoChart from './components/DemoChart';
import DemoTable from './components/DemoTable';
import {
  AlignLeftOutlined,
  BarChartOutlined,
  FieldNumberOutlined,
  LineChartOutlined,
  PieChartOutlined,
  TableOutlined,
} from '@ant-design/icons';

interface ITemaplateDrawerProps {
  disabled?: boolean;
  onClick?: (widgetFormData: IWidgetFormData) => void;
}

enum EDrawerMode {
  FULL_HIDE = 'full_hide',
  HOVER_HIDE = 'hover_hide',
  SHOW = 'show',
}

function TemplateDrawer({ disabled = false, onClick }: ITemaplateDrawerProps, ref: any) {
  const [drawerVisiable, setDrawerVisiable] = useState<boolean>(false);
  const [drawerMode, setDrawerMode] = useState<EDrawerMode>(EDrawerMode.FULL_HIDE);
  const [templates, setTemplates] = useState<IWidgetFormData[]>([]);

  useEffect(() => {
    (async () => {
      const { success, data } = await queryAllTemplateWidgets();
      if (success) {
        data.sort((a, b) => {
          return +new Date(a.created_at!) - +new Date(b.created_at!);
        });
        setTemplates(data);
      }
    })();
  }, []);

  const openDrawer = useCallback(() => {
    setDrawerMode(EDrawerMode.SHOW);
    setDrawerVisiable(true);
  }, []);

  const closeDrawer = useCallback(() => {
    setDrawerVisiable(false);
    setTimeout(() => {
      setDrawerMode(EDrawerMode.FULL_HIDE);
    }, 100);
  }, []);

  useImperativeHandle(
    ref,
    () => {
      return {
        open: openDrawer,
        close: closeDrawer,
      };
    },
    [],
  );

  const templatesContentRender = () => {
    const titlePlaceholderKey = Symbol('title-placeholder');
    const classifiedTemplates = (templates || []).reduce((classifiedObj: any, curr, index) => {
      if (templates?.length === 0) {
        return [];
      }
      if (!classifiedObj[curr.viz_type]) {
        classifiedObj[curr.viz_type] = [curr];
      } else {
        classifiedObj[curr.viz_type].push(curr);
      }
      if (index === templates?.length - 1) {
        // end
        return Object.keys(classifiedObj).reduce((list: any[], key: string) => {
          return [
            ...list,
            {
              id: titlePlaceholderKey,
              viz_type: key,
            },
            ...(classifiedObj[key] || []),
          ] as IWidgetFormData[];
        }, []);
      } else {
        return classifiedObj;
      }
    }, {});

    if (!Array.isArray(classifiedTemplates)) {
      return [];
    }
    return classifiedTemplates.map((template: IWidgetFormData) => {
      if ((template.id as any) === titlePlaceholderKey) {
        return (
          <div className={styles['drawer-title']}>
            <h2>{CHART_TYPE_MAP[template.viz_type].label}</h2>
          </div>
        );
      }
      return (
        <div className={styles['drawer-item']} key={template.id}>
          <Card
            style={{ height: '100%' }}
            bordered
            size="small"
            title={template.name}
            bodyStyle={{
              height: '90%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            {(() => {
              const { templateCoverData = '', y_axis_format } = parseObjJson<IWidgetSpecification>(
                template.specification,
              );
              if (!templateCoverData) {
                return template.viz_type === EVisualizationType.BigNumberTotal ? (
                  <FieldNumberOutlined style={{ fontSize: '44px' }} />
                ) : template.viz_type === EVisualizationType.TimeHistogram ? (
                  <LineChartOutlined style={{ fontSize: '44px' }} />
                ) : template.viz_type === EVisualizationType.Bar ? (
                  <AlignLeftOutlined style={{ fontSize: '44px' }} />
                ) : template.viz_type === EVisualizationType.Column ? (
                  <BarChartOutlined style={{ fontSize: '44px' }} />
                ) : template.viz_type === EVisualizationType.Time_Column ? (
                  <BarChartOutlined style={{ fontSize: '44px' }} />
                ) : template.viz_type === EVisualizationType.Pie ? (
                  <PieChartOutlined style={{ fontSize: '44px' }} />
                ) : template.viz_type === EVisualizationType.Table ? (
                  <TableOutlined style={{ fontSize: '44px' }} />
                ) : (
                  '图表类型错误!'
                );
              }
              if (template.viz_type === EVisualizationType.BigNumberTotal) {
                return <h2>{templateCoverData}</h2>;
              } else if (
                [
                  EVisualizationType.Bar,
                  EVisualizationType.Column,
                  EVisualizationType.Pie,
                  EVisualizationType.TimeHistogram,
                  EVisualizationType.Time_Column,
                ].includes(template.viz_type)
              ) {

                try{
                  return (
                    <DemoChart
                      viz_type={template.viz_type}
                      y_axis_format={y_axis_format}
                      widgetOption={JSON.parse(templateCoverData!)}
                    />
                  );
                }catch(e){
                  // console.log(e)
                }

              } else if (template.viz_type === EVisualizationType.Table) {
                return <DemoTable datas={JSON.parse(templateCoverData!)} />;
              }
              return <></>;
            })()}
          </Card>
          <div
            onClick={throttle((e: any) => {
              e.preventDefault();
              e.stopPropagation();
              onClick && onClick(template);
            }, 2000)}
            className={styles['drawer-item__cover']}
          ></div>
        </div>
      );
    });
  };

  return (
    <>
      <style>
        {`
          :root {
            ${(() => {
              if (drawerMode === EDrawerMode.FULL_HIDE) {
                return `
                        --hideButtonWidth: 20px;
                        --hideButtonColor: white;
                        --hideButtonBKColor: rgba(0, 0, 0, 0.15);
                        `;
              } else if (drawerMode === EDrawerMode.HOVER_HIDE) {
                return `
                        --hideButtonWidth: 30px;
                        --hideButtonColor: rgba(0, 0, 0, 0.55);
                        --hideButtonBKColor: white;
                        `;
              }
            })()}  
          }
        `}
      </style>
      <div
        onMouseLeave={() => {
          if (drawerMode === EDrawerMode.SHOW) return;
          if (drawerMode === EDrawerMode.HOVER_HIDE) {
            setDrawerMode(EDrawerMode.FULL_HIDE);
            setDrawerVisiable(false);
          }
        }}
        onMouseEnter={() => {
          if (drawerMode === EDrawerMode.SHOW) return;
          setDrawerMode(EDrawerMode.HOVER_HIDE);
          setDrawerVisiable(true);
        }}
        onClick={openDrawer}
      >
        <div
          style={{
            display: disabled ? 'none' : '',
          }}
          className={styles['hide_button']}
        >
          {'<'}
        </div>
        <Drawer
          title="图表模板选择"
          placement="right"
          width={(() => {
            if (drawerMode === EDrawerMode.SHOW) {
              return '100%';
            } else if (drawerMode === EDrawerMode.HOVER_HIDE) {
              return 10;
            } else {
              return 0;
            }
          })()}
          forceRender={true}
          closable={false}
          mask={false}
          style={{
            height: '100vh',
            cursor: drawerMode === EDrawerMode.SHOW ? 'default' : 'pointer',
          }}
          extra={
            <Button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                closeDrawer();
              }}
              size="small"
              type="link"
              icon={<img width={20} src={HIDE_SVG} />}
            ></Button>
          }
          autoFocus={false}
          open={drawerVisiable}
          getContainer={false}
          zIndex={10}
        >
          <div className={styles['drawer-container']}>
            {templatesContentRender()}
            <span className={styles['drawer-item__placeholder']}></span>
            <span className={styles['drawer-item__placeholder']}></span>
            <span className={styles['drawer-item__placeholder']}></span>
          </div>
        </Drawer>
      </div>
    </>
  );
}

export default React.memo(React.forwardRef(TemplateDrawer));
