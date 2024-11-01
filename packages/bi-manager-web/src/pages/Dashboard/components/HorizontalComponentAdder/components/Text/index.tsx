import { IGridLayoutItem } from '@/components/GridLayout/typings';
import { Input } from 'antd';
import { useMemo } from 'react';

interface IComponentTextProps {
  layoutItemId: string;
  layouts: ReactGridLayout.Layout[];
  /** Dashboard 布局变化回调接口 */
  onLayoutChange?: (allLayouts: IGridLayoutItem[]) => void;
  texts: Map<string, string>;
}

export default function ({ layoutItemId, layouts, onLayoutChange, texts }: IComponentTextProps) {
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
    <>
      <Input
        value={text}
        placeholder="Text"
        bordered={false}
        style={{ height: '50px', fontSize: '40px' }}
        onChange={(e) => {
          const copyLayouts = [...layouts];
          texts?.set(copyLayouts[layoutIndex].i, e.target.value);
          onLayoutChange && onLayoutChange(copyLayouts);
        }}
      />
    </>
  );
}
