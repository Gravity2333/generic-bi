import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import styles from './index.less';

interface ISegmentContainerProps {
  /** 子元素 */
  children?: React.ReactNode;
  /** 自定义style */
  style?: Record<string, any>;
  /** 箭头style */
  arrowStyle?: Record<string, any>;
  cardHeight?: number,
}

const AUTO_WIDTH_CONTAINER_ID = 'auto_width_container_id';

/** 分段分析容器 */
export default function AutoWidthContainer({
  children,
  style = {},
  arrowStyle = {},
  cardHeight = 100,
}: ISegmentContainerProps) {
  const [showLeftArrow, setLeftArrow] = useState<boolean>(false);
  const [showRightArrow, setRightArrow] = useState<boolean>(false);

  const setArrows = (e: HTMLElement) => {
    const { scrollLeft, clientWidth, scrollWidth } = e;
    const scrollRight = scrollWidth - (clientWidth + scrollLeft);
    if (scrollLeft > 0) {
      setLeftArrow(true);
    } else {
      setLeftArrow(false);
    }
    if (scrollRight > 0) {
      setRightArrow(true);
    } else {
      setRightArrow(false);
    }
  };

  useEffect(() => {
    const c = document.getElementById(AUTO_WIDTH_CONTAINER_ID);
    const refresh = () => {
      if (c) {
        setArrows(c);
      }
    };
    setTimeout(() => {
      refresh();
    });
    window.addEventListener('resize', refresh);
    return () => {
      window.removeEventListener('resize', refresh);
    };
  }, []);

  useEffect(() => {
    const c = document.getElementById(AUTO_WIDTH_CONTAINER_ID);
    setTimeout(() => {
      if (c) {
        setArrows(c);
      }
    });
  }, [children]);

  return (
    <div style={{ position: 'relative' }}>
      <div
        className={styles['segment-conatiner']}
        style={{
          height: `${cardHeight + 40}px`,
          ...style,
        }}
        id={AUTO_WIDTH_CONTAINER_ID}
        onScrollCapture={(e) => {
          setArrows(e.target as HTMLElement);
        }}
      >
        {children}
        {showLeftArrow ? (
          <div
            className={styles['segment-conatiner--left-arrow']}
            style={{
              top: `${(cardHeight + 40) / 2 - 60}px`,
              ...arrowStyle,
            }}
            onClick={() => {
              const c = document.getElementById(AUTO_WIDTH_CONTAINER_ID);
              if (c) {
                c.scrollLeft -= c?.clientWidth / 5;
              }
            }}
          >
            <LeftOutlined />
          </div>
        ) : (
          ''
        )}
        {showRightArrow ? (
          <div
            className={styles['segment-conatiner--right-arrow']}
            style={{
              top: `${(cardHeight + 40) / 2 - 60}px`,
              ...arrowStyle,
            }}
            onClick={() => {
              const c = document.getElementById(AUTO_WIDTH_CONTAINER_ID);
              if (c) {
                c.scrollLeft += c?.clientWidth / 5;
              }
            }}
          >
            <RightOutlined />
          </div>
        ) : (
          ''
        )}
      </div>
    </div>
  );
}
