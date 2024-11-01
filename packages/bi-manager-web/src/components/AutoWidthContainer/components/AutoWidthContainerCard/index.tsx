import { Col, Row } from 'antd';

export interface ISegmentCardProps {
  /** 对其方式 */
  align?: 'middle' | 'top' | 'bottom' | 'stretch';
  /** 子元素 */
  children?: React.ReactNode;
  /** 自定义宽度 */
  width?: string;
  /** 自定义style */
  style?: Record<string, any>;
  /** 自定义bodystyle */
  bodyStyle?: Record<string, any>;
  cardWidth?: number,
  title?: string,
}

/** 分段分析卡片 */
export default function AutoWidthContainerCard({
  align = 'middle',
  children,
  width,
  style = {},
  bodyStyle = {},
  cardWidth = 300,
}: ISegmentCardProps) {

  return (
    <div
      style={{
        height: `${cardWidth}px`,
        width: width || `${cardWidth}px`,
        display: 'inline-block',
        position: 'relative',
        ...style,
      }}
    >
      <div style={{
        height: '100%',
        overflow: 'hidden',
        ...bodyStyle,
      }}>
        {children}
      </div>
    </div>
  );
}
