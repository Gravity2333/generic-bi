import { Empty } from 'antd';

/**
 * 渲染表格空白提示
 * @param height 表格内容区域高度
 */
export const TableEmpty = ({
  componentName = 'EnhancedTable',
  height,
}: {
  componentName?: 'ProTable' | 'EnhancedTable' | 'smallTable';
  height: number | string;
}) => {
  let emptyHeight = height;
  if (typeof height === 'number') {
    if (componentName === 'EnhancedTable') {
      // 32 和 16 是父层容器的 padding 和 margin
      emptyHeight = height - 32 - 16;
    }
    if (componentName === 'ProTable') {
      // 16px 是父层容器的 padding
      // 2px 是为了防止表格出现滚动条
      emptyHeight = height - 16 - 2;
    }
    if (componentName === 'smallTable') {
      emptyHeight = height - 16 - 2;
    }
  }

  const styleProps: React.CSSProperties =
    height > 0
      ? {
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          margin: 0,
          height: emptyHeight,
        }
      : {};

  return <Empty style={styleProps} image={Empty.PRESENTED_IMAGE_SIMPLE} />;
};
