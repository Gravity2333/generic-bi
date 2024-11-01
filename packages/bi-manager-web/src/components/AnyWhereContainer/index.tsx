import classnames from 'classnames';
import React from 'react';
import styles from './index.less';

interface Props {
  top: number;
  left: number;
  display: boolean;
  className?: string;
  style?: React.CSSProperties;
  children: any;
}

const AnyWhereContainer = React.forwardRef<HTMLDivElement, Props>((props, ref) => {
  const { top, left, display, children, className, style } = props;

  if (!display) {
    return null;
  }

  return (
    <>
      <div
        ref={ref}
        className={classnames({ [styles.container]: true, className })}
        style={{ ...style, top, left }}
      >
        {children}
      </div>
    </>
  );
});

export default AnyWhereContainer;
