import { IGridLayoutItem } from '@/components/GridLayout/typings';
import { Divider, Input } from 'antd';
import { useMemo } from 'react';

interface IComponentTextDividerProps {
  layoutItemId: string;
  layouts: ReactGridLayout.Layout[];
  /** Dashboard 布局变化回调接口 */
  onLayoutChange?: (allLayouts: IGridLayoutItem[]) => void;
  texts: Map<string, string>;
}

/** 带标题的Divider */
export default function ({
  layoutItemId,
  layouts,
  onLayoutChange,
  texts,
}: IComponentTextDividerProps) {
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

  const text = useMemo(() => {
    if (layouts && layoutIndex >= 0 && texts) {
      return texts?.get(layouts[layoutIndex].i);
    }
    return '';
  }, [layouts, layoutIndex]);

  return (
    <div>
      <Divider>
        <Input
          value={text || ''}
          placeholder="Title"
          bordered={false}
          style={{
            fontSize: '20px',
            width: `${(text || '').length * 20 + 25}px`,
            minWidth: '100px',
          }}
          onChange={(e) => {
            const copyLayouts = [...layouts];
            copyLayouts[layoutIndex] = {
              ...copyLayouts[layoutIndex],
            } as any;
            texts?.set(copyLayouts[layoutIndex].i, e.target.value);
            onLayoutChange && onLayoutChange(copyLayouts);
          }}
        />
      </Divider>
    </div>
  );
}
