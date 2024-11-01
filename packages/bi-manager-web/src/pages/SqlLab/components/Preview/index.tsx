import EnhancedTableRender from '@/pages/Widget/components/Renderer/components/EnhancedTableRender';
import { initPage } from '@/common';
import { Result, Skeleton } from 'antd';
import { useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { exploreSqlJson } from '@/services/sqllab';
import React from 'react';
import { cancelQueryWidgetData } from '@/services';

function SQLPreview(
  { sql, setLoading, initId }: { sql?: string; setLoading?: any; initId?: string },
  ref: any,
) {
  const [tableData, setTableData] = useState<any[]>([]);
  const [tableColumns, setTableColumns] = useState<any[]>([]);
  const [exploreLoading, setExploreLoading] = useState<boolean>(false);
  const [exploreSuccess, setExploreSuccess] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const id = useMemo(() => {
    return initId || uuidv4();
  }, [initId]);
  const sqlRef = useRef<string>();
  const exploreSql = async (sqlParam?: string) => {
    if (!(sqlParam || sql)) {
      return;
    }
    sqlRef.current = sqlParam || sql;
    setExploreLoading(true);
    setLoading && setLoading(true);
    const { success, data, message } =
      (await exploreSqlJson(sqlParam || sql || '', id))?.data || {};
    setExploreSuccess(success);
    if (success) {
      if (data![0]) {
        const sample = data![0];
        const list = [];
        for (let k in sample) {
          list.push({
            headerName: k,
            key: uuidv4(),
            ellipsis: true,
            field: k,
            sorter: (a: any, b: any) => a[k] - b[k],
          });
        }
        setTableColumns(list);
      } else {
        setTableColumns([]);
      }
      setTableData(data!);
    } else {
      setTableColumns([]);
      setTableData([]);
      setErrorMessage(message || '');
    }
    setExploreLoading(false);
    setLoading && setLoading(false);
  };

  // 命令式的给`ref.current`赋值个对象
  useImperativeHandle(ref, () => ({
    reload: (sqlParam?: string) => {
      exploreSql(sqlParam);
    },
  }));

  useEffect(() => {
    exploreSql();
    return () => {
      cancelQueryWidgetData(id);
    };
  }, []);

  return (
    <>
      <div
        style={{
          margin: '10px',
          overflowY: 'auto',
          overflowX: 'auto',
          height: '100%',
          width: '100%',
        }}
      >
        {(() => {
          if (exploreLoading) {
            return <Skeleton />;
          }
          if (exploreSuccess) {
            return (
              <EnhancedTableRender
                id={id}
                data={tableData}
                columns={tableColumns}
                tableColumns={tableColumns}
                pagination={initPage}
                autoResize={true}
              />
            );
          } else {
            if (errorMessage?.includes('Exception: Syntax error: failed at position')) {
              return <Result status="warning" title={'SQL语法错误!'} extra={errorMessage} />;
            }
            return <Result status="warning" title={'查询错误!'} extra={errorMessage} />;
          }
        })()}
      </div>
    </>
  );
}

export default React.forwardRef(SQLPreview);
