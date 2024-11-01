import { jumpToParent } from '@/utils/sendMsgToParent';
import { ChartProperties } from '@bi/common';
import { Card } from 'antd';
import ResizeObserver from 'rc-resize-observer';
import { useMemo, useState } from 'react';
import { useLocation } from 'umi';
import styles from './index.less';

export type BigNumberValueType = number | string;
export const DEFAULT_NUMBER_STYLE = {
  grid: {
    left: 'undefinedpx',
    top: 'undefinedpx',
    right: 'undefinedpx',
    bottom: 'undefinedpx',
  },
  legend: {
    type: 'scroll',
    orient: 'horizontal',
    bottom: 'bottom',
  },
  colorRange: ['#e6f7ff', '#40a9ff'],
  font_family: 'Lucida Console',
  title_font_size: 13,
  value_font_size: 27,
  show_title: true,
  auto_size: false,
  click_font: false,
  font_jump_url: '',
};

interface IBigNumberRenderProps {
  title: string;
  value?: BigNumberValueType;
  chartProperties?: Partial<ChartProperties>;
  onClick?: any;
}

const BigNumberRender = ({ title, value, chartProperties, onClick }: IBigNumberRenderProps) => {
  const [height, setHeight] = useState<number>(0);
  const {
    font_family,
    show_title,
    title_font_size,
    value_font_size,
    auto_size,
    click_font,
    font_jump_url,
  } = chartProperties || {};

  const location = useLocation();
  const canJump = useMemo(() => {
    return location?.pathname?.includes('/dashboard/tab') && click_font;
  }, [location, click_font]);
  const titleDivStyles: React.CSSProperties = useMemo(() => {
    if (!height || !auto_size) {
      return { fontSize: `${((title_font_size as number) / 100) * height}px` };
    }
    // 容器高度 - 20，给滚动条预留位置，防止多次渲染
    // TODO: 这里暂时设定字体 = 容器高度的六分之一
    return { fontSize: (height - 20) / 6 };
  }, [height, font_family, auto_size, title_font_size]);

  const valueDivStyles: React.CSSProperties = useMemo(() => {
    if (!height || !auto_size) {
      return { fontSize: `${((value_font_size as number) / 100) * height}px` };
    }
    // 容器高度 - 20，给滚动条预留位置，防止多次渲染
    // TODO: 这里暂时设定字体 = 容器高度的六分之一
    return { fontSize: (height - 20) / 6 };
  }, [height, font_family, auto_size, title_font_size]);

  return (
    <ResizeObserver
      onResize={({ height }) => {
        setHeight(height);
      }}
    >
      <Card
        hoverable={!!canJump||onClick}
        style={{ height: '100%' }}
        onClick={
          onClick ||
          (() => {
            if (canJump) {
              jumpToParent(font_jump_url as string, {}, false);
            }
          })
        }
      >
        <div style={{ ...titleDivStyles, fontFamily: font_family as string }}>
          {show_title ? <span>{title}</span> : null}
        </div>
        <div
          className={styles['big-number']}
          style={{ ...valueDivStyles, fontFamily: font_family as string }}
        >
          {value !== undefined ? <div>{value}</div> : <div>数据错误</div>}
        </div>
      </Card>
    </ResizeObserver>
  );
};

export default BigNumberRender;
