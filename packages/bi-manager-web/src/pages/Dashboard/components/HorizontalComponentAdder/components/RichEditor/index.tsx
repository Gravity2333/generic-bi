import { IGridLayoutItem } from '@/components/GridLayout/typings';
import { useEffect, useRef, useMemo, useState } from 'react';
import E from 'wangeditor';

interface IComponentRichEditorProps {
  layoutItemId: string;
  layouts: ReactGridLayout.Layout[];
  /** Dashboard 布局变化回调接口 */
  onLayoutChange?: (allLayouts: IGridLayoutItem[]) => void;
  texts: Map<string, string>;
}

export default function ({
  layoutItemId,
  layouts,
  onLayoutChange,
  texts,
}: IComponentRichEditorProps) {
  const editorElemMenu = useRef();
  const editorElemBody = useRef();
  const [currentHtml, setCurrentHtml] = useState<any>(undefined);
  let editor: any;
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

  useEffect(() => {
    if (currentHtml === undefined) {
      return;
    }
    const copyLayouts = [...layouts];
    copyLayouts[layoutIndex] = {
      ...copyLayouts[layoutIndex],
    } as any;
    texts?.set(copyLayouts[layoutIndex].i, currentHtml);
    onLayoutChange && onLayoutChange(copyLayouts);
  }, [currentHtml]);

  useEffect(() => {
    const elemMenu = editorElemMenu.current;
    const elemBody = editorElemBody.current;
    editor = new E(elemMenu, elemBody);
    editor.config.onchange = () => {
      setCurrentHtml(editor.txt.html());
    };
    editor.config.menus = [
      'head', // 标题
      'bold', // 粗体
      'fontSize', // 字号
      'fontName', // 字体
      'italic', // 斜体
      'underline', // 下划线
      'strikeThrough', // 删除线
      'undo', // 撤销
    ];
    editor.create();
    editor.txt.html(text);
    if (!onLayoutChange) {
      editor.disable();
    }
    setCurrentHtml(text);
  }, []);

  return (
    <div style={{ height: '100%', width: '100%', position: 'relative', zIndex: 99 }}>
      <div
        ref={editorElemMenu as any}
        style={{
          display: onLayoutChange ? 'block' : 'none',
          position: 'absolute',
          left: '0px',
          top: '0px',
        }}
      ></div>
      <div
        ref={editorElemBody as any}
        style={{ paddingTop: onLayoutChange ? '30px' : '0px', height: '100%', overflow: 'hidden' }}
      ></div>
    </div>
  );
}
