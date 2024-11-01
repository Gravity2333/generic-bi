import { useLayoutEffect, useRef, useState } from 'react';
import styles from './index.less';
import { CaretDownOutlined, CaretUpOutlined, LeftOutlined, RightOutlined } from '@ant-design/icons';

function isContentOverflown(element: any) {
  // 创建一个DOM元素，将需要测量的内容克隆进去，并且隐藏它
  const clone = element?.cloneNode(true);
  if (!clone) return false;
  clone.style.visibility = 'hidden';
  clone.style.position = 'absolute';
  clone.style.width = 'auto';
  // 将克隆元素添加到文档中
  document.body.appendChild(clone);

  // 获取元素的宽度和内容的宽度
  const elementWidth = element.offsetWidth;
  const contentWidth = clone.scrollWidth;

  // 移除克隆元素
  document.body.removeChild(clone);

  // 判断内容是否超出
  return contentWidth > elementWidth;
}

/**
 * 折叠过长数据
 */
const EllipsisFold = ({
  children,
  showArrowBtn = false,
}: {
  children?: any;
  showArrowBtn?: boolean;
}) => {
  const contentRef = useRef<any>();
  const childrenUnEmpty = children?.length > 0;
  const [needArrow, setNeedArrow] = useState<boolean>(false);
  const [isExpand, setExpand] = useState<boolean>(false);
  const [offset, setOffset] = useState<number>(20);

  function handleMousWheel(e: any) {
    e.preventDefault();
    e.stopPropagation();
    contentRef.current.scrollLeft += e.deltaY;
  }

  const handleScrollLeft = () => {
    contentRef.current.scrollLeft -= offset;
  };

  const handleScrollRight = () => {
    contentRef.current.scrollLeft += offset;
  };

  const handleExpand = () => {
    setExpand(true);
  };

  const handleUnExpand = () => {
    setExpand(false);
  };

  useLayoutEffect(() => {
    if (!childrenUnEmpty) return;
    const observer = new ResizeObserver((e) => {
      // console.log(e[0]?.contentRect.width)
      setOffset(e[0]?.contentRect.width / 2);
      setNeedArrow(isContentOverflown(contentRef.current));
    });
    if (contentRef.current) {
      observer.observe(contentRef.current);
    }
    return () => observer.disconnect();
  }, [childrenUnEmpty]);

  useLayoutEffect(() => {
    if (needArrow && childrenUnEmpty) {
      contentRef.current.addEventListener('mousewheel', handleMousWheel);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    return () => contentRef?.current?.removeEventListener('mousewheel', handleMousWheel);
  }, [needArrow, childrenUnEmpty]);

  return childrenUnEmpty ? (
    <div className={styles['ellipsis-scroll']}>
      {needArrow && showArrowBtn ? (
        <LeftOutlined
          style={{ display: isExpand ? 'none' : 'block' }}
          onClick={handleScrollLeft}
          className={styles['ellipsis-scroll__left']}
        />
      ) : (
        <span
          style={{
            display: isExpand ? 'none' : 'block',
          }}
          className={styles['ellipsis-scroll__placeholder']}
        />
      )}

      <div
        ref={contentRef}
        style={{ scrollBehavior: 'smooth', display: isExpand ? 'none' : 'block' }}
        className={styles['ellipsis-scroll__center']}
      >
        {children}
      </div>

      <div
        style={{
          display: !isExpand ? 'none' : 'block',
        }}
        className={styles['ellipsis-scroll__center-expand']}
      >
        {children}
      </div>

      {needArrow && showArrowBtn ? (
        <RightOutlined
          style={{ display: isExpand ? 'none' : 'block' }}
          onClick={handleScrollRight}
          className={styles['ellipsis-scroll__right']}
        />
      ) : (
        <></>
      )}
      {/* {isExpand ? (
        <CaretUpOutlined
          style={{ display: !isExpand ? 'none' : 'block' }}
          onClick={handleUnExpand}
          className={styles['ellipsis-scroll__expand']}
        />
      ) : (
        <CaretDownOutlined
          style={{ display: !needArrow ? 'none' : 'block' }}
          onClick={handleExpand}
          className={styles['ellipsis-scroll__expand']}
        />
      )} */}
    </div>
  ) : (
    <></>
  );
};

export default EllipsisFold;
