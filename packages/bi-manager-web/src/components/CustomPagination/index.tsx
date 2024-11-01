import storage from '@/utils/storage';
import { LeftOutlined, RightOutlined, StepBackwardOutlined } from '@ant-design/icons';
import { Select } from 'antd';
import numeral from 'numeral';
import React, { memo, useCallback, useEffect, useImperativeHandle, useMemo, useState } from 'react';
import styles from './index.less';
import classNames from 'classnames';
export const pageSizeOptions = ['10', '20', '50', '100'];
export const DEFAULT_PAGE_SIZE_KEY = 'commonPageSize';

export const PAGE_DEFAULT_SIZE = 20;

export const getCurrentPageSize = () => {
  return parseInt(storage.get(DEFAULT_PAGE_SIZE_KEY) || '20', 10) || PAGE_DEFAULT_SIZE;
};

// 最好是奇数
const SHOW_ITEM_PAGE = 5;

interface IPageItem {
  page: number;
  show: boolean;
}

interface CustomPaginationProps {
  currentPage: number;
  pageSize: number;
  total: number;
  /**
   * 当前页的记录数
   */
  onChange: (currentPage: number, pageSize: number) => void;
  // 一般表示分页总数正在加载
  loading?: boolean;
  // 禁止点击分页
  disabled?: boolean;
}

const CustomPagination: React.FC<CustomPaginationProps> = (props) => {
  const {
    // currentPage = 1,
    pageSize,
    total = 0,
    onChange,
    loading = false,
    disabled = false,
  } = props;
  const totalPages = Math.ceil(total / pageSize || 1);

  const initPageList = useCallback(
    (args?: { clickPage?: number }) => {
      const initCurrentPage = 1;
      const { clickPage } = args || {};
      const res = [];
      for (let index = 0; index < SHOW_ITEM_PAGE && totalPages - 1 >= index; index++) {
        res.push({
          page: (clickPage || initCurrentPage) + index || 1,
          show: initCurrentPage + index === initCurrentPage,
        });
      }
      return res;
    },
    [totalPages],
  );
  const [pageList, setPageList] = useState<IPageItem[]>(initPageList);

  const currentListItem = useMemo(() => pageList.find((page) => page.show)?.page, [pageList]);

  // 存在总页数，就以页数来计算是否可以进行翻页
  // 不存在总页数时，就以当前页的记录数 < 每页的最大的记录数来判断
  const nextDisabled = currentListItem === totalPages; //currentPage >= total / pageSize;
  const prevDisabled = currentListItem === 1;

  useEffect(() => {
    setPageList(() => initPageList());
  }, [totalPages]);

  const onPageSizeChange = (selectPageSize: number) => {
    onChange(1, selectPageSize);
    const tmpTotalPages = Math.ceil(total / selectPageSize) || 1;
    setPageList(() => {
      const res = [];
      for (let index = 0; index < SHOW_ITEM_PAGE && tmpTotalPages - 1 >= index; index++) {
        res.push({ page: index + 1, show: !index });
      }
      return res;
    });
    storage.put(DEFAULT_PAGE_SIZE_KEY, selectPageSize);
  };

  const handlePageChange = (item: IPageItem) => {
    if (item.page !== currentListItem) {
      onChange(item.page, pageSize);
      const pageStep = (SHOW_ITEM_PAGE - 1) / 2;
      const endPage = Math.min(
        item.page <= pageStep ? SHOW_ITEM_PAGE : item.page + pageStep,
        totalPages,
      );
      const startPage = Math.max(
        endPage - item.page < pageStep ? endPage - pageStep * 2 : item.page - pageStep,
        1,
      );
      const res = [];
      for (let index = 0; index < SHOW_ITEM_PAGE && startPage + index <= endPage; index++) {
        res.push({
          page: startPage + index,
          show: startPage + index === item.page,
        });
      }
      setPageList(res);
    } else {
      setPageList((pref) => {
        const newList = pref.map((ele) => ({ ...ele, show: item.page === ele.page }));
        return newList;
      });
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'row-reverse', marginRight: 20 }}>
      <ul
        className={classNames({
          [styles.pagination]: true,
          [styles.disabled]: !!disabled || !!loading,
        })}
      >
        {(!loading || total > 0) && (
          <li style={{ userSelect: 'text' }}>共 {numeral(total).format('0,0')} 条</li>
        )}
        <li
          onClick={() => {
            if (!prevDisabled) {
              onChange(1, pageSize);
              setPageList(() => {
                return initPageList({ clickPage: 1 });
              });
            }
          }}
          style={{ userSelect: 'text' }}
          className={`${styles.firstPage} ${prevDisabled ? styles.disabled : ''}`}
        >
          <StepBackwardOutlined />
          返回首页
        </li>
        <li
          onClick={() => {
            if (!prevDisabled) {
              // onChange(currentPage - 1, pageSize);
              handlePageChange({
                page: (currentListItem || 1) - 1,
                show: false,
              });
            }
          }}
          className={`${styles.prev} ${prevDisabled ? styles.disabled : ''}`}
        >
          <LeftOutlined />
          {/* &nbsp;上一页 */}
        </li>
        <div className="">
          {pageList.map((item) => {
            return (
              <li
                key={item.page}
                className={`${item.show ? styles.current : styles.other} header-text`}
                onClick={() => {
                  handlePageChange(item);
                }}
              >
                {item.page}
              </li>
            );
          })}
        </div>
        <li
          className={`${styles.next} ${nextDisabled ? styles.disabled : ''}`}
          onClick={() => {
            if (!nextDisabled) {
              // onChange(currentPage + 1, pageSize);
              handlePageChange({
                page: (currentListItem || 1) + 1,
                show: false,
              });
            }
          }}
        >
          {/* 下一页&nbsp; */}
          <RightOutlined />
        </li>
        <li>
          <Select size="small" key={pageSize} defaultValue={pageSize} onChange={onPageSizeChange}>
            {pageSizeOptions.map((size) => (
              <Select.Option key={size} value={+size}>
                {`${size}条/页`}
              </Select.Option>
            ))}
          </Select>
          {/* 共 {numeral(totalPages).format('0,0')} 页 */}
        </li>
      </ul>
    </div>
  );
};

export default memo(CustomPagination)