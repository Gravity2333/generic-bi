import classNames from 'classnames';
import ResizeObserver from 'rc-resize-observer';
import type { ReactNode } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import styles from './index.less';

interface IAutoHeightContainerProps {
  autoHeight?: boolean;
  className?: string;
  headerRender?: ReactNode | string;
  /** 内容区域自定义样式 */
  contentStyle?: React.CSSProperties;
  onHeightChange?: (height: number) => void;
}

const AutoHeightContainer: React.FC<IAutoHeightContainerProps> = ({
  headerRender,
  children,
  className,
  contentStyle,
  onHeightChange,
  autoHeight = true,
}) => {
  // header容器的高度
  const [headerHeight, setHeaderHeight] = useState<number>(0);
  // 内容容器的高度
  const [contentHeight, setContentHeight] = useState<number>(200);

  const headerRef = useRef<HTMLDivElement>(null);

  const updatePosition = useCallback(() => {
    if (!autoHeight) {
      return;
    }
    const headerRect = headerRef?.current?.getBoundingClientRect();
    if (headerRect) {
      const newWrapHeight = window.innerHeight - headerHeight - headerRect.top;
      // 最后减10是外层的 margin-bottom
      setContentHeight(newWrapHeight);
      if (onHeightChange) {
        onHeightChange(newWrapHeight);
      }
    }
  }, [autoHeight, headerHeight, onHeightChange]);

  const handleResize = useCallback(() => {
    updatePosition();
  }, [updatePosition]);

  useEffect(() => {
    updatePosition();
    handleResize();
    // 让resize事件触发handleResize
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [handleResize, updatePosition]);

  if (!autoHeight) {
    return (
      <>
        {headerRender}
        {children}
      </>
    );
  }

  return (
    <div className={classNames(styles.autoHeightPageView, className)}>
      <ResizeObserver
        onResize={(size) => {
          setHeaderHeight(size.height);
        }}
      >
        <div className={styles.autoHeightPageView__header} ref={headerRef}>
          {headerRender}
        </div>
      </ResizeObserver>
      <div
        className={styles.autoHeightPageView__content}
        style={{ ...contentStyle, height: autoHeight ? contentHeight : 'auto' }}
      >
        {children}
      </div>
    </div>
  );
};

export default AutoHeightContainer;
