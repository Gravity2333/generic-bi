import CheckboxMenu from './components/CheckboxMenu';
import type {
  CellClickedEvent,
  ColDef,
  ColumnMovedEvent,
  ColumnResizedEvent,
  GridReadyEvent,
  ICellRendererComp,
  ICellRendererParams,
  SortChangedEvent,
} from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.min.css';
import { AgGridReact } from 'ag-grid-react';
import { useMemoizedFn } from 'ahooks';
import classNames from 'classnames';
import { debounce } from 'lodash';
import { CSSProperties, ReactNode, useContext } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import AutoHeightContainer from '../AutoHeightContainer';
import { TableEmpty } from './components/TableEmpty';
import TableLoading from './components/TableLoading';
import styles from './index.less';
import type { ESortDirection, IColumnStorage, IPagination } from './typing';
import useDynamicTheme from '@/hooks/useDynamicTheme';
import { WidgetEditorContext } from '@/pages/Widget/Editor';
import CustomPagination from '../CustomPagination';

class RowIndexRenderer implements ICellRendererComp {
  eGui!: HTMLDivElement;
  init(params: ICellRendererParams) {
    this.eGui = document.createElement('div');
    this.eGui.innerHTML = '' + (params.rowIndex + 1);
  }
  refresh(): boolean {
    return false;
  }
  getGui(): HTMLElement {
    return this.eGui;
  }
}

const defaultColDef: ColDef = {
  resizable: true,
  comparator: () => 0,
  unSortIcon: true,
};

type ColumnType<T> = ColDef<T> & { field: string };

interface Props<TData> {
  columns: ColumnType<TData>[];
  tableKey: string;
  data?: TData[];
  showSequence?: boolean;

  tableContainerStyle?: CSSProperties;

  pagination?: IPagination;
  defaultShowCols?: string[];
  loading?: boolean;
  /** 额外的表格头部工具栏 */
  extraTool?: ReactNode;
  /** autoHeight */
  autoHeight?: boolean;
  /** 黑暗主题 */
  darkMode?: boolean;
  /** 单元格点击回调 */
  onCellClicked?: (e: CellClickedEvent) => void;
  /** 表格列显隐变化回调,仅当变化列不是变化之前的子集时，才会调用，其他情况下不会调用
   *  例如：a,b,c --> a,b 则onColumnChange不会调用
   *        a,b,c --> a,c,d 则onColumnChange调用
   */
  onColumnChange?: (fields: string[]) => void;
  /** 排序变化 */
  onSortChange?: (field: string, direction: ESortDirection) => void;
  /** pageChange */
  onPageChange?: (current: number, pageSize: number) => void;
  /** 初始化列 */
  initColumns?: any[];
  rowStyle?: Record<string, any>;
}

function InnerTable<RecordType extends Record<string, any>>(props: Props<RecordType>) {
  const {
    data,
    columns: columnsProp,
    pagination,
    tableKey,
    showSequence,
    defaultShowCols,
    loading,
    extraTool,
    darkMode,
    autoHeight = true,
    tableContainerStyle,
    onColumnChange,
    onSortChange,
    onCellClicked,
    onPageChange,
    initColumns = null,
    rowStyle = {},
  } = props;

  // 表格ref
  const gridRef = useRef<AgGridReact<RecordType>>(null);

  const [tableReady, setTableReady] = useState(false);

  // 分页配置
  const [internalPagination, setInternalPagination] = useState<
    | {
        currentPage: number;
        pageSize: number;
      }
    | undefined
  >(
    pagination && {
      currentPage: pagination.current,
      pageSize: pagination.pageSize,
    },
  );

  // 表格列持久存储
  const columnStorageRef = useRef<IColumnStorage[]>([]);

  // 表格列重置字段
  const resetCols = useRef(defaultShowCols || columnsProp.map((item) => item.field));
  const { setTableColums } = useContext(WidgetEditorContext);

  // 表格列声明
  const [finnalColumns, setFinnalColumns] = useState<ColumnType<RecordType>[]>(() => {
    const seqCol: ColumnType<RecordType> = {
      headerName: '#',
      field: '#',
      maxWidth: 80,
      pinned: 'left',
      cellRenderer: RowIndexRenderer,
    };

    if (initColumns !== null && initColumns?.length > 0) {
      const currentFields = columnsProp.map((item) => item.field);
      const cacheCols = initColumns as IColumnStorage[];
      const cacheFields = cacheCols.map((item) => item.field);

      // 查看缓存列字段与传入的列字段是否发生变化
      const fieldIsChange = !(
        currentFields.every((field) => {
          return cacheFields.includes(field);
        }) &&
        cacheFields.every((field) => {
          return currentFields.includes(field);
        })
      );

      // 如果没有发生变化
      if (!fieldIsChange) {
        const columns: ColumnType<RecordType>[] = cacheCols.map((cacheCol) => {
          return {
            ...(columnsProp.find((c) => c?.field === cacheCol?.field) || {}),
            ...cacheCol,
          };
        });
        onColumnChange?.(columns.filter((item) => !item.hide).map((item) => item.field));
        if (showSequence) {
          columns?.unshift(seqCol);
        }
        return columns;
      }
    }

    let defaultCols = columnsProp;

    if (defaultShowCols !== undefined) {
      onColumnChange?.(defaultShowCols);
      defaultCols = columnsProp.map((item) => {
        return {
          ...item,
          hide: !defaultShowCols.includes(item.field),
        };
      });
    }

    onColumnChange?.(defaultCols.filter((item) => !item.hide).map((item) => item.field));
    if (showSequence) {
      return [seqCol, ...defaultCols];
    }

    return [...defaultCols];
  });

  useEffect(() => {
    if (internalPagination) {
      onPageChange?.(internalPagination.currentPage, internalPagination.pageSize);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [internalPagination]);

  const handleCellClicked = useMemoizedFn((params: CellClickedEvent) => {
    onCellClicked?.(params);
  });

  const handleColumnMoved = useMemoizedFn((e: ColumnMovedEvent) => {
    const toIndex = e.toIndex;
    const source = e.column?.getColDef().field;
    if (toIndex !== undefined) {
      const sourceColDef = columnStorageRef.current.splice(
        columnStorageRef.current.findIndex((item) => item.field === source),
        1,
      );
      columnStorageRef.current.splice(toIndex, 0, ...sourceColDef);
      setTableColums && setTableColums(columnStorageRef.current);
    }
  });

  const handleColumnResize = useMemoizedFn(
    debounce((e: ColumnResizedEvent) => {
      const actualWidth = e.column?.getActualWidth();
      const field = e.column?.getColDef().field;

      columnStorageRef.current = columnStorageRef.current.map((item) => {
        if (item.field === field) {
          return {
            ...item,
            width: actualWidth || 100,
          };
        }
        return item;
      });
      let totalWidth = 0;
      const newColumns = e.columnApi
        .getAllGridColumns()
        .filter((item) => {
          return item.getColDef().field !== '#';
        })
        .map((item) => {
          const colDef = item.getColDef();
          totalWidth += item.getActualWidth();
          return {
            field: colDef.field!,
            width: item.getActualWidth(),
            hide: !!colDef.hide,
          };
        });

      columnStorageRef.current = columnStorageRef.current?.map((c) => {
        const w = newColumns?.find((nc) => nc?.field === c?.field)?.width || 1;
        return {
          ...c,
          flex: w / (totalWidth || 1),
        };
      });
      setTableColums && setTableColums(columnStorageRef.current);
    }, 100),
  );

  const handleGridReady = useMemoizedFn((e: GridReadyEvent<RecordType>) => {
    setTableReady(true);
    // 在tableReady中设置columnCache，可以实现，columProp不需要为每一列显示设定宽度，
    // 在tableReady后可以直接使用实际渲染宽度
    columnStorageRef.current = e.columnApi
      .getAllGridColumns()
      .filter((item) => {
        return item.getColDef().field !== '#';
      })
      .map((item) => {
        const colDef = item.getColDef();
        return {
          field: colDef.field!,
          width: item.getActualWidth(),
          hide: !!colDef.hide,
        };
      });
  });

  /**
   * fields: 不含序号列
   */
  const handleColumnHideChange = useMemoizedFn((fields: string[]) => {
    setFinnalColumns((prev) => {
      return prev.map((item) => {
        if (item.field === '#') {
          return item;
        }
        return {
          ...item,
          hide: !fields.includes(item.field as string),
        };
      });
    });
    const shouldCallColumnChange = fields.some(
      (field) => columnStorageRef.current.findIndex((col) => col.field !== field) !== -1,
    );
    columnStorageRef.current = columnStorageRef.current.map((item) => {
      return {
        ...item,
        hide: !fields.includes(item.field),
      };
    });
    setTableColums && setTableColums(columnStorageRef.current);
    if (shouldCallColumnChange) {
      onColumnChange?.(fields);
    }
  });

  /** 排序变化 */
  const handleSortChange = useMemoizedFn((e: SortChangedEvent) => {
    const sortColState = e.columnApi.getColumnState().find((item) => !!item.sort);
    if (sortColState) {
      const sortField = sortColState.colId;
      const sordDirection = sortColState.sort;
      onSortChange?.(sortField, sordDirection as ESortDirection);
    }
  });

  // 数据更新时，使用grid api更新表格数据
  // 如果直接使用rowData，会导致表格闪烁
  // 这里必须等待表格ready后再设置数据，否则，初始调用的setRowData会失败，
  // 导致界面可能会在无限loading,
  useEffect(() => {
    if (tableReady) {
      gridRef.current?.api.setRowData(data || []);
    }
  }, [data, tableReady]);

  // 控制表格加载状态
  useEffect(() => {
    if (tableReady) {
      if (loading) {
        gridRef.current?.api.showLoadingOverlay();
      } else {
        gridRef.current?.api.hideOverlay();
      }
    }
  }, [loading, tableReady]);

  const gridDom = useMemo(() => {
    return (
      <AgGridReact
        ref={gridRef}
        sortingOrder={['desc', 'asc', 'desc']}
        onGridReady={handleGridReady}
        onCellClicked={handleCellClicked}
        suppressDragLeaveHidesColumns={true}
        columnDefs={finnalColumns}
        defaultColDef={defaultColDef}
        pivotPanelShow={'always'}
        onSortChanged={handleSortChange}
        onColumnResized={handleColumnResize}
        onColumnMoved={handleColumnMoved}
        loadingOverlayComponent={TableLoading}
        noRowsOverlayComponent={TableEmpty}
        noRowsOverlayComponentParams={{
          height: '100%',
        }}
        headerHeight={38}
        rowStyle={rowStyle}
      />
    );
  }, [
    finnalColumns,
    handleCellClicked,
    handleColumnMoved,
    handleColumnResize,
    handleGridReady,
    handleSortChange,
  ]);

  const header = useMemo(() => {
    return (
      <div
        className={styles.header}
        style={{
          display: 'flex',
          justifyContent: 'right',
          paddingRight: '10px',
          paddingBottom: '5px',
        }}
      >
        <div className={styles.extra}>{extraTool}</div>
        <CheckboxMenu
          options={finnalColumns
            .filter((item) => item.field !== '#')
            .map((item) => {
              return {
                label: item.headerName as string,
                value: item.field as string,
                disabled: !!item.pinned,
              };
            })}
          onChange={handleColumnHideChange}
          value={finnalColumns
            .filter((item) => !item.hide && item.field !== '#')
            .map((item) => {
              return item.field as string;
            })}
          resetValues={resetCols}
        />
      </div>
    );
  }, [extraTool, finnalColumns, handleColumnHideChange]);

  return (
    <AutoHeightContainer
      autoHeight={autoHeight}
      className={styles.tableContainer}
      headerRender={!!setTableColums ? <>{header}</> : undefined}
    >
      <div
        style={{
          height: !!setTableColums ? 'calc(100% - 40px)' : 'calc(100% - 5px)',
          ...tableContainerStyle,
        }}
        className={classNames([styles.body, 'full-parent'], {
          'ag-theme-alpine-dark': darkMode,
          'ag-theme-alpine': !darkMode,
        })}
      >
        {gridDom}
      </div>
      {internalPagination && (
        <div
          className={styles.footer}
          style={{
            position: 'absolute',
            right: '0px',
            bottom: '5px',
          }}
        >
          <CustomPagination
            {...internalPagination}
            total={pagination?.total || 0}
            onChange={(current, pageSize) => {
              setInternalPagination({
                currentPage: current,
                pageSize,
              });
            }}
          />
        </div>
      )}
    </AutoHeightContainer>
  );
}

function EnhancedTableV3<RecordType extends Record<string, any>>(
  props: Omit<Props<RecordType>, 'darkMode'>,
) {
  const [, isDark] = useDynamicTheme();

  return <InnerTable darkMode={isDark} {...props} />;
}

export default EnhancedTableV3;
