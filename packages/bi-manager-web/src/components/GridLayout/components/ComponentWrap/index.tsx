import Text from '@/pages/Dashboard/components/HorizontalComponentAdder/components/Text';
import Divider from '@/pages/Dashboard/components/HorizontalComponentAdder/components/Divider';
import TextDivider from '@/pages/Dashboard/components/HorizontalComponentAdder/components/TextDivider';
import RichEditor from '@/pages/Dashboard/components/HorizontalComponentAdder/components/RichEditor';
import Tabs from '@/pages/Dashboard/components/HorizontalComponentAdder/components/Tabs';
import Time from '@/pages/Dashboard/components/HorizontalComponentAdder/components/Time';
import MultSourceCard from '@/pages/Dashboard/components/HorizontalComponentAdder/components/MultSourceCard';
import ActiveAssets from '@/pages/Dashboard/components/HorizontalComponentAdder/components/ActiveAssets';
import NewFoundedAssets from '@/pages/Dashboard/components/HorizontalComponentAdder/components/NewFoundedAssets';
import Alarms from '@/pages/Dashboard/components/HorizontalComponentAdder/components/Alarms';
import { ECOMPONENTTYPE } from '@/pages/Dashboard/components/HorizontalComponentAdder/typing';
import { DeleteOutlined, DragOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { IGridLayoutItem } from '../../typings';

/**
 * 渲染小组件
 */
interface IComponentProps {
  type: string;
  onRemove?: (layoutItemId: string) => void;
  layoutItemId: string;
  layouts: ReactGridLayout.Layout[];
  /** Dashboard 布局变化回调接口 */
  onLayoutChange?: (allLayouts: IGridLayoutItem[]) => void;
  /** 只读预览状态 */
  readonly?: boolean;
  texts: Map<string, any>;
  changeLayouts: (id: string, layout: Record<string, any>) => void;
}

export default function ComponentWrap({
  type,
  onRemove,
  layouts,
  layoutItemId,
  onLayoutChange,
  readonly,
  texts,
  changeLayouts,
}: IComponentProps) {
  const defaultUnDraggable =
    type === ECOMPONENTTYPE.RICHEDITOR ||
    type === ECOMPONENTTYPE.TEXT ||
    type === ECOMPONENTTYPE.TEXTDIVIDER ||
    type === ECOMPONENTTYPE.MULTISOURCECARD ||
    type === ECOMPONENTTYPE.TABS
    ;

  const [isDraggable, setDraggable] = useState<boolean>(defaultUnDraggable ? false : true);

  useEffect(() => {
    if (defaultUnDraggable) {
      changeLayouts(layoutItemId, { isDraggable });
    }
  }, [isDraggable]);

  return (
    <div style={{ height: '100%', overflow: 'hidden', position: 'relative' }}>
      {onRemove && (
        <div style={{ position: 'absolute', top: '0px', right: '0px', zIndex: 100 }}>
          {defaultUnDraggable ? (
            <DragOutlined
              style={{ cursor: 'move', marginRight: '5px' }}
              onMouseMove={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (!isDraggable) {
                  setDraggable(true);
                }
              }}
              onMouseLeave={(e) => {
                e.preventDefault();
                if (isDraggable) {
                  setDraggable(false);
                }
              }}
            />
          ) : (
            ''
          )}
          <DeleteOutlined
            style={{ cursor: 'pointer' }}
            onClick={() => {
              onRemove(layoutItemId);
            }}
          />
        </div>
      )}
      <>
        {(() => {
          if (type === ECOMPONENTTYPE.TEXT) {
            return (
              <Text
                texts={texts}
                layouts={layouts}
                layoutItemId={layoutItemId}
                onLayoutChange={onLayoutChange}
              />
            );
          } else if (type === ECOMPONENTTYPE.DIVIDER) {
            return <Divider />;
          } else if (type === ECOMPONENTTYPE.TEXTDIVIDER) {
            return (
              <TextDivider
                texts={texts}
                layouts={layouts}
                layoutItemId={layoutItemId}
                onLayoutChange={onLayoutChange}
              ></TextDivider>
            );
          } else if (type === ECOMPONENTTYPE.RICHEDITOR) {
            return (
              <RichEditor
                texts={texts}
                layouts={layouts}
                layoutItemId={layoutItemId}
                onLayoutChange={onLayoutChange}
              ></RichEditor>
            );
          } else if (type === ECOMPONENTTYPE.TABS) {
            return (
              <Tabs
                texts={texts}
                layouts={layouts}
                layoutItemId={layoutItemId}
                onLayoutChange={onLayoutChange}
                readonly={readonly}
              ></Tabs>
            );
          } else if (type === ECOMPONENTTYPE.TIME) {
            return <Time />;
          } else if (type === ECOMPONENTTYPE.MULTISOURCECARD) {
            return (
              <MultSourceCard
                texts={texts}
                layouts={layouts}
                layoutItemId={layoutItemId}
                onLayoutChange={onLayoutChange}
                readonly={readonly}
              />
            );
          } else if (type === ECOMPONENTTYPE.BUILTIN_ACTIVEASSETS) {
            return <ActiveAssets />;
          } else if (type === ECOMPONENTTYPE.BUILTIN_NEW_FOUNDED_ASSETS) {
            return <NewFoundedAssets />;
          } else if (type === ECOMPONENTTYPE.ALARM) {
            return <Alarms />;
          }

          return <></>;
        })()}
      </>
    </div>
  );
}
