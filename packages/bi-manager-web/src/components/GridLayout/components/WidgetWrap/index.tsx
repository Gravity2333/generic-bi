import { ITimeRangeContext, TimeRangeContext } from '@/pages/Dashboard/Editor';
import { EmbedTabContext } from '@/pages/Dashboard/Tab';
import { jumpToParent } from '@/utils/sendMsgToParent';
import { IWidgetFormData, IWidgetSpecification, parseObjJson } from '@bi/common';
import { Button, Card, Dropdown, Menu } from 'antd';
import { useContext, useEffect, useMemo, useState } from 'react';
import { history } from 'umi';
import { getWidgetIdFromLayoutIndex } from '../../utils';
import { v4 as uuidv4 } from 'uuid';
import { CopyOutlined, DeleteOutlined, EditOutlined, EllipsisOutlined } from '@ant-design/icons';
import AddToDashboard from '@/pages/Widget/components/Renderer/components/AddToDashboard';
import WidgetPreview from '@/pages/Widget/Preview';
import useEmbed from '@/hooks/useEmbed';

/**
 * 渲染Widget图表
 */

interface IWidgetWrapProps {
  layoutItemId: string;
  changeLayouts: (id: string, layout: Record<string, any>) => void;
  onRemove?: (layoutItemId: string) => void;
}

export default function WidgetWrap({ layoutItemId, onRemove, changeLayouts }: IWidgetWrapProps) {
  const widgetId = getWidgetIdFromLayoutIndex(layoutItemId);
  const { setTimeRange } = useContext<ITimeRangeContext>(TimeRangeContext);
  const { queryList: queryEmbedDashboards, fetchDashboardDetail } = useContext(EmbedTabContext);
  const [widget, setWidget] = useState<IWidgetFormData>();
  // const [vizType, setVieType] = useState<EVisualizationType>();
  // const [sqlInfo, setSqlInfo] = useState<IWidgetFormData>();
  const [isDraggable, setDraggable] = useState<boolean>(true);
  const specification = useMemo(() => {
    if (widget) {
      return parseObjJson<IWidgetSpecification>(widget?.specification || '{}');
    }
    return {};
  }, [widget]);

  const [embed, location] = useEmbed();
  /** 处理编辑widget */
  const handleEditWidget = () => {
    if (embed) {
      jumpToParent('/report/widget', { embedUrl: `/embed/widget/${widgetId}/update` }, false);
    } else {
      history.push(`/widget/${widgetId}/update`);
    }
  };

  /** 设置仪表盘展示时间 */
  useEffect(() => {
    if (widget?.specification) {
      const { time_range } = parseObjJson<IWidgetSpecification>(widget.specification);
      if (time_range) {
        setTimeRange(time_range);
      }
    }
  }, [widget]);

  useEffect(() => {
    changeLayouts(layoutItemId, { isDraggable });
  }, [isDraggable]);

  const dropDownMenu = useMemo(() => {
    return (
      <Dropdown
        key={uuidv4()}
        overlay={
          <Menu>
            <Menu.Item key={uuidv4()} disabled={widget?.readonly === '1'}>
              <a onClick={() => handleEditWidget()}>
                <EditOutlined style={{ marginRight: '10px' }} />
                编辑图表
              </a>
            </Menu.Item>
            <AddToDashboard
              icon={<CopyOutlined style={{ color: 'black' }} />}
              id={widgetId}
              isCheckSaved={false}
              mode="menu"
              title="拷贝到仪表盘"
              onSuccess={() => {
                queryEmbedDashboards && queryEmbedDashboards(false);
                fetchDashboardDetail && fetchDashboardDetail();
              }}
            />
            {onRemove ? (
              <Menu.Item key={uuidv4()}>
                <a onClick={() => onRemove(layoutItemId)}>
                  <DeleteOutlined style={{ marginRight: '10px' }} />
                  删除
                </a>
              </Menu.Item>
            ) : null}
          </Menu>
        }
        trigger={['click']}
        placement="bottom"
      >
        <Button
          type="link"
          size="small"
          icon={<EllipsisOutlined style={{ fontSize: '20px', cursor: 'pointer' }} />}
          onClick={(e) => {
            e.stopPropagation();
          }}
          // onMouseEnter={(e) => {
          //   e.preventDefault();
          //   e.stopPropagation();
          //   if (isDraggable) {
          //     setDraggable(false);
          //   }
          // }}
          // onDragLeave={(e) => {
          //   e.preventDefault();
          //   if (!isDraggable) {
          //     setDraggable(true);
          //   }
          // }}
          // onMouseLeave={(e) => {
          //   e.preventDefault();
          //   if (!isDraggable) {
          //     setDraggable(true);
          //   }
          // }}
        />
      </Dropdown>
    );
  }, [widget, widgetId, layoutItemId]);

  return (
    <>
      {(specification as IWidgetSpecification)?.widget_embed ? (
        <Card
          style={{ height: '100%' }}
          size="small"
          bodyStyle={{ padding: 0, height: `100%`, overflow: 'hidden', position: 'relative' }}
          bordered={false}
        >
          {location.pathname?.includes('/default-dashboard') ? null : (
            <div style={{ position: 'absolute', right: '5px', top: '0px', zIndex: 10 }}>
              {dropDownMenu}
            </div>
          )}

          <WidgetPreview key={widgetId} widgetId={widgetId} onWidgetReady={setWidget} />
        </Card>
      ) : (
        <Card
          style={{ height: '100%' }}
          size="small"
          title={widget?.name}
          bodyStyle={{ padding: 12, height: `calc(100% - 40px)`, overflow: 'hidden' }}
          extra={location.pathname?.includes('/default-dashboard') ? null : [dropDownMenu]}
        >
          <WidgetPreview key={widgetId} widgetId={widgetId} onWidgetReady={setWidget} />
        </Card>
      )}
    </>
  );
}
