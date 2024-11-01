import { IWidgetFormData, parseObjJson } from '@bi/common';
import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Responsive, ResponsiveProps, WidthProvider } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { v1 as uuidv1 } from 'uuid';
import {
  COMPONENT_TYPE_LIST,
  ECOMPONENTTYPE,
} from '@/pages/Dashboard/components/HorizontalComponentAdder/typing';
import styles from './index.less';
import WidgetWrap from './components/WidgetWrap';
import { getWidgetIdFromLayoutIndex } from './utils';
import ComponentWrap from './components/ComponentWrap';
import { DROPPING_ELEM_ID, IGridLayoutItem, IGridLayoutProps, SEPARATOR_ID } from './typings';
import { DashboardContext, IDashboardContext } from '@/layouts/DashboardLayout';

const ResponsiveReactGridLayout = WidthProvider(Responsive);
const cols = { lg: 12 };

export default function GridLayout(props: IGridLayoutProps) {
  const { initLayouts = [], onLayoutChange, layoutInfoFuncRef, readonly = true, texts } = props;

  const [layouts, setLayouts] = useState<IGridLayoutItem[]>(initLayouts);
  /** layout快速查找索引 */
  const layoutsSearchIndex = useRef<Record<string, number>>({});

  const updateLayoutSearchIndex = (newLayouts: IGridLayoutItem[]) => {
    layoutsSearchIndex.current = newLayouts.reduce((pre, cur, index) => {
      return {
        ...pre,
        [cur.i]: index,
      };
    }, {});
  };

  const changeLayouts = (id: string, layout: Record<string, any>) => {
    const index = layoutsSearchIndex.current[id];
    if (index >= 0) {
      const newLayouts = [...layouts];
      newLayouts[index] = {
        ...newLayouts[index],
        ...layout,
      };
      setLayouts(newLayouts);
    }
  };

  const layoutsFormatter = useMemo(() => {
    const formatter = layouts.map((layout) => ({
      ...layout,
      ...(() => {
        if (readonly) {
          return {
            isResizable: !readonly,
            isDraggable: !readonly,
          };
        }
        return {};
      })(),
    }));
    updateLayoutSearchIndex(formatter);
    return formatter;
  }, [readonly, layouts]);

  const { dashboards = [] } = useContext<IDashboardContext>(DashboardContext);

  /**
   * 处理拖拽
   */
  const handleDrop: ResponsiveProps['onDrop'] = (newLayouts, layoutItem, _event) => {
    // @ts-ignore
    const dataTransfer = _event.dataTransfer.getData('text/plain');
    let newLayoutItem: IGridLayoutItem;
    if (COMPONENT_TYPE_LIST.find((type) => type === dataTransfer)) {
      newLayoutItem = {
        ...layoutItem,
        i: uuidv1() + SEPARATOR_ID + dataTransfer,
        isDraggable:
          dataTransfer === ECOMPONENTTYPE.RICHEDITOR ||
          dataTransfer === ECOMPONENTTYPE.TEXT ||
          dataTransfer === ECOMPONENTTYPE.TEXTDIVIDER ||
          dataTransfer === ECOMPONENTTYPE.MULTISOURCECARD
            ? false
            : true,
      };
    } else {
      // @ts-ignore
      const widget = parseObjJson<IWidgetFormData>(dataTransfer);
      newLayoutItem = {
        ...layoutItem,
        i: uuidv1() + SEPARATOR_ID + widget.id,
      };
    }

    // 替换掉新拖拽的这个 item
    // 理论上是在最后一个，所以倒序查找，找到一个直接退出
    for (let i = newLayouts.length - 1; i >= 0; i--) {
      if (newLayouts[i].i === DROPPING_ELEM_ID) {
        newLayouts[i] = newLayoutItem;
        break;
      }
    }

    layouts.forEach((layout) => {
      if ((layout as any).text !== undefined) {
        newLayouts.forEach((newlayout) => {
          if (newlayout.i === layout.i) {
            (newlayout as any).text = (layout as any).text;
          }
        });
      }
    });
    setLayouts(newLayouts as IGridLayoutItem[]);
    updateLayoutSearchIndex(newLayouts);
  };

  /** 处理删除widget */
  const handleRemoveItem = (i: string) => {
    const filteredLayouts = layouts.filter((el) => el.i !== i);
    setLayouts(filteredLayouts as IGridLayoutItem[]);
    updateLayoutSearchIndex(filteredLayouts);
    if (texts) {
      texts.delete(i);
    }
  };

  /**
   * Grid layout 布局变更
   */
  const handleLayoutChange: ResponsiveProps['onLayoutChange'] = (_, allLayouts) => {
    if (!setLayouts) {
      return;
    }
    // 拖拽触发的布局变更
    // 这种情况下，由 handleDrop 接管
    const newLayouts = (allLayouts?.lg || []) as IGridLayoutItem[];
    if (newLayouts.some((el) => el.i === DROPPING_ELEM_ID)) {
      return;
    }
    layouts.forEach((layout) => {
      if ((layout as any).text !== undefined) {
        newLayouts.forEach((newlayout) => {
          if (newlayout.i === layout.i) {
            (newlayout as any).text = (layout as any).text;
          }
        });
      }
    });
    setLayouts(newLayouts);
  };

  /** 生成DOM */
  const generateDOM = useCallback(() => {
    return layoutsFormatter.map((l) => {
      const id = getWidgetIdFromLayoutIndex(l.i);
      if (COMPONENT_TYPE_LIST.find((type) => type === id)) {
        return (
          <div
            key={l.i}
            data-grid={l}
            style={{
              overflow: 'hidden',
              cursor: readonly ? '' : 'move',
              // paddingRight: '10px',
              // minHeight: `${id === ECOMPONENTTYPE.RICHEDITOR ? '200px' : undefined}`,
            }}
          >
            <ComponentWrap
              layoutItemId={l.i}
              type={id}
              onRemove={!readonly ? handleRemoveItem : undefined}
              layouts={layouts}
              onLayoutChange={!readonly ? setLayouts : undefined}
              readonly={readonly}
              texts={texts}
              changeLayouts={changeLayouts}
            />
          </div>
        );
      }
      return (
        <div key={l.i} data-grid={l} style={{ cursor: readonly ? '' : 'move' }}>
          <WidgetWrap
            changeLayouts={changeLayouts}
            layoutItemId={l.i}
            onRemove={!readonly ? handleRemoveItem : undefined}
          />
        </div>
      );
    });
  }, [layoutsFormatter, readonly, dashboards]);

  const handleDragStart = (a: any, b: any, c: any, d: any, e: any) => {
    e.stopPropagation();
  };

  useEffect(() => {
    /** 设置layoutInfoFunc */
    if (layoutInfoFuncRef) {
      const getLayoutFunc = function () {
        return layouts;
      };
      layoutInfoFuncRef.current = getLayoutFunc;
    }
    if (onLayoutChange) {
      onLayoutChange(layouts);
    }
  }, [layouts]);

  return (
    <ResponsiveReactGridLayout
      className={styles['grid-layout']}
      breakpoint="lg"
      layouts={{
        lg: layoutsFormatter,
      }}
      autoSize={true}
      cols={cols}
      preventCollision={readonly}
      isResizable={!readonly}
      isDraggable={!readonly}
      rowHeight={50}
      // 允许拖拽
      // @see: https://github.com/react-grid-layout/react-grid-layout/blob/master/test/examples/15-drag-from-outside.jsx
      isDroppable={!readonly}
      onDragStart={handleDragStart}
      onDrop={handleDrop}
      // https://github.com/react-grid-layout/react-grid-layout/blob/master/lib/ReactGridLayoutPropTypes.js#L222
      droppingItem={{ i: DROPPING_ELEM_ID, w: 3, h: 3 }}
      onLayoutChange={handleLayoutChange}
    >
      {generateDOM()}
    </ResponsiveReactGridLayout>
  );
}
