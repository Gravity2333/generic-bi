import storage from './storage';
import { RollbackOutlined, SearchOutlined } from '@ant-design/icons';
import type { SearchConfig } from '@ant-design/pro-table/lib/components/Form/FormRender';
import type { PaginationProps } from 'antd';
import { Space } from 'antd';
import numeral from 'numeral';

export const proTableSerchConfig: SearchConfig = {
  labelWidth: 80,
  // 默认展开所有的搜索条件
  collapsed: false,
  // 不显示收起按钮
  collapseRender: false,
  span: 8,
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

export const PRO_TABLE_RESET_SPAN_SIZE = 1700;

export const DEFAULT_PAGE_SIZE_KEY = 'biCommonPageSize';

export const pageSizeOptions = ['10', '20', '50', '100'];
export const PAGE_DEFAULT_SIZE = 20;

export const getCurrentPageSize = () => {
  return parseInt(storage.get(DEFAULT_PAGE_SIZE_KEY) || '20', 10) || PAGE_DEFAULT_SIZE;
};

export const proTablePagination: PaginationProps = {
  pageSizeOptions,
  defaultPageSize: parseInt(storage.get(DEFAULT_PAGE_SIZE_KEY) || '20', 10) || PAGE_DEFAULT_SIZE,
  defaultCurrent: 1,
  showSizeChanger: true,
  hideOnSinglePage: false,
  size: 'small',
  onChange: (page, pageSize) => {
    storage.put(DEFAULT_PAGE_SIZE_KEY, pageSize);
  },
  showTotal: (total) => {
    return `共 ${numeral(total).format('0,0')} 条`;
  },
};

export const defPageSize = () => {
  return +(storage.get(DEFAULT_PAGE_SIZE_KEY) || PAGE_DEFAULT_SIZE)
};

interface IPageSetting {
  onChangePage?: (page: number, pageSize: number) => void;
}

export const getTablePaginationDefaultSettings = (props?: IPageSetting): PaginationProps => {
  const { onChangePage = () => {} } = props || {};
  return {
    pageSizeOptions,
    defaultPageSize: defPageSize(),
    defaultCurrent: 1,
    showSizeChanger: true,
    hideOnSinglePage: false,
    size: 'small',
    onChange: (page, pageSize) => {
      onChangePage(page, pageSize);
      storage.put(DEFAULT_PAGE_SIZE_KEY, pageSize);
    },
    showTotal: (total) => {
      return `共 ${numeral(total).format('0,0')} 条`;
    },
  };
};
