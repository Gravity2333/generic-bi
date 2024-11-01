import type { SearchConfig } from '@ant-design/pro-table/lib/components/Form/FormRender';
import { PaginationProps, Space } from 'antd';
import { RollbackOutlined, SearchOutlined } from '@ant-design/icons';

export const initPage: PaginationProps = {
  current: 0,
  total: 0,
  showTotal: (total: number) => `共 ${total} 条`,
  pageSize: 20,
  pageSizeOptions: ['10', '20', '30', '40', '50'],
  hideOnSinglePage: false,
  showSizeChanger: false,
  showQuickJumper: false,
};

export const proTableSerchConfig: SearchConfig = {
  labelWidth: 80,
  // 默认展开所有的搜索条件
  collapsed: false,
  // 不显示收起按钮
  collapseRender: false,
  span: { xs: 12, sm: 12, md: 6, lg: 6, xl: 6, xxl: 6 },
  searchText: (
    <Space>
      <SearchOutlined />
      查询
    </Space>
  ) as any,
  resetText: (
    <Space>
      <RollbackOutlined />
      重置
    </Space>
  ) as any,
  optionRender: (searchConfig, formProps, dom) => [...dom.reverse()],
};

/**
 * TOKEN 在 session storage 中的健值
 */
export const BI_AUTH_TOKEN_KEY = 'bi-token';
