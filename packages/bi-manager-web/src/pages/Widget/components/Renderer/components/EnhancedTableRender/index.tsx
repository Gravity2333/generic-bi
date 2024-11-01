import { getCurrentPageSize } from '@/components/CustomPagination';
import EllipsisDiv from '@/components/EllipsisDiv';
import EnhancedTableV3 from '@/components/EnhancedTableV3';
import { Button, Descriptions, Modal, Tag } from 'antd';
import { useMemo, useState } from 'react';
import './index.less';
import EllipsisFold from '@/components/EllipsisFold';

interface Props {
  id: string;
  columns: any[];
  data: any[];
  tableColumns: any[];
  pagination?: any;
  autoResize?: boolean;
  rowStyle?: Record<string, any>;
}

function objectRender(obj: Record<string, any> = {}, title: string = '') {
  const keys = (() => {
    if (obj === null || obj === undefined) {
      return [];
    }
    return Object.keys(obj);
  })();

  if (keys?.length === 0) {
    return <></>;
  }
  return (
    <Button
      type="link"
      size="small"
      onClick={() => {
        Modal.info({
          title: `${title}详情`,
          width: '800px',
          bodyStyle: {
            padding: '10px',
          },
          centered: true,
          icon: <></>,
          okText: '关闭',
          content: (
            <Descriptions bordered size="small" column={2} style={{ marginTop: '10px' }}>
              {keys.map((k) => (
                <Descriptions.Item contentStyle={{ width: '50%' }} label={k}>
                  {obj[k]}
                </Descriptions.Item>
              ))}
            </Descriptions>
          ),
        });
      }}
    >
      点击查看详情
    </Button>
  );
}

/** 渲染复杂类型 */
function rendComplexCell(data: any, title: string = '') {
  if (Array.isArray(data)) {
    return (
      <EllipsisFold showArrowBtn>
        {data.map((item,index) => (
          <Tag key={index}>{item}</Tag>
        ))}
      </EllipsisFold>
    );
  } else {
    return objectRender(data, title);
  }
}

export default function EnhancedTableRender({
  id,
  columns,
  data,
  tableColumns,
  pagination,
  autoResize,
  rowStyle,
}: Props) {
  const [pageOption, setPageOption] = useState<{
    total: number;
    pageSize: number;
    showSizeChanger: boolean;
    current: number;
  }>({
    total: data?.length,
    pageSize: pagination?.pageSize || 10,
    showSizeChanger: pagination?.showSizeChanger || false,
    current: 1,
  });

  const handlePageChange = (e: number, pageSize: number) => {
    setPageOption({
      ...pageOption,
      current: e,
      pageSize,
    });
  };

  const showData = useMemo(() => {
    const end =
      pageOption?.current * pageOption?.pageSize >= data?.length
        ? data?.length
        : pageOption?.current * pageOption?.pageSize;
    return data.slice((pageOption?.current - 1) * pageOption?.pageSize, end);
  }, [pageOption]);

  return (
    <div
      style={{
        height: '100%',
        overflow: 'hidden',
        position: 'relative',
        paddingBottom: pagination ? '40px' : '20px',
      }}
    >
      <EnhancedTableV3<any>
        tableKey={id}
        columns={columns?.map((c) => ({
          ...c,
          flex: autoResize ? 1 : undefined,
          ...(() => {
            if (c.cellRenderer) {
              return {
                cellRenderer: ({ value }: any) => {
                  if (typeof value === 'object') {
                    return rendComplexCell(value, c.headerName);
                  }
                  return <EllipsisDiv placement="topLeft">{c.cellRenderer({ value })}</EllipsisDiv>;
                },
              };
            } else {
              return {
                cellRenderer: ({ value }: any) => {
                  if (typeof value === 'object') {
                    return rendComplexCell(value, c.headerName);
                  }
                  return <EllipsisDiv placement="topLeft">{value}</EllipsisDiv>;
                },
              };
            }
          })(),
        }))}
        data={!pagination ? data : showData}
        initColumns={tableColumns.map((c) => {
          if (!autoResize) {
            delete c.flex;
            return c;
          }
          return c;
        })}
        autoHeight={false}
        rowStyle={rowStyle}
        // onCellClicked={(e) => {
        //   var textValue = document.createElement('textarea');
        //   textValue.setAttribute('readonly', 'readonly'); //设置只读属性防止手机上弹出软键盘
        //   textValue.value = e.value;
        //   document.body.appendChild(textValue); //将textarea添加为body子元素
        //   textValue.select();
        //   document.execCommand('copy');
        //   document.body.removeChild(textValue); //移除DOM元素
        //   message.info('复制成功');
        // }}
        onPageChange={handlePageChange}
        pagination={
          pagination
            ? {
                total: pageOption?.total || 0,
                pageSize: pageOption?.pageSize || getCurrentPageSize(),
                current: pageOption?.current,
              }
            : undefined
        }
      />
      {/* {pagination && (
        <div
          style={{
            position: 'absolute',
            right: '0px',
            bottom: '0px',
            width: '100%',
            background: 'white',
            paddingBottom: '5px',
            display: 'flex',
            justifyContent: 'right',
            padding: '10px',
          }}
        >
          <Pagination
            size="small"
            showSizeChanger={false}
            onChange={handlePageChange}
            current={pageOption?.current}
            total={pageOption?.total}
            pageSize={pageOption?.pageSize}
            style={{ display: 'inline-block' }}
          />
        </div>
      )} */}
    </div>
  );
}
