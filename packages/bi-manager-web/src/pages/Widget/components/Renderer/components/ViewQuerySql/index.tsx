import { CopyOutlined } from '@ant-design/icons';
import { Button, Card, Menu, message, Modal, Table } from 'antd';
import { ReactNode, useMemo, useState } from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { v4 as uuidv4 } from 'uuid';
import { EWidgetActionKey } from '../..';
//@ts-ignore
import { format } from 'sql-formatter';

const CopyToClipboardWrap = ({ text }: { text: string }) => {
  return (
    <CopyToClipboard
      text={text}
      onCopy={(_, success: boolean) => {
        if (success) {
          message.success('复制成功');
        } else {
          message.error('复制失败');
        }
      }}
    >
      <Button type="text" icon={<CopyOutlined />}>
        复制
      </Button>
    </CopyToClipboard>
  );
};

interface IViewQuerySqlProps {
  sql: string;
  explain: string;
  children?: ReactNode;
  colNames: string[];
  queriesData: any;
}
const ViewQuerySql = (props: IViewQuerySqlProps) => {
  const [showquerySql, setShowQuerySql] = useState<boolean>(false);
  const [showQueryData, setShowQueryData] = useState<boolean>(false);

  const columns = useMemo(() => {
    const { colNames } = props;
    return colNames.map((name) => ({
      title: name,
      dataIndex: name,
      key: uuidv4(),
      sorter: (a: any, b: any) => a[name] - b[name],
      render: (value: any) => {
        if (value instanceof Array) {
          return value?.join(', ');
        }
        return value;
      },
    }));
  }, [props.colNames]);

  return (
    <>
      {props.children ? (
        props.children
      ) : (
        <>
          {
            <Menu.Item key={EWidgetActionKey.QuerySql} onClick={() => setShowQuerySql(true)}>
              查看SQL代码
            </Menu.Item>
          }
          <Menu.Item key={EWidgetActionKey.QueryData} onClick={() => setShowQueryData(true)}>
            查看查询数据
          </Menu.Item>
        </>
      )}
      <Modal
        destroyOnClose
        width="50%"
        visible={showquerySql}
        title="查看SQL代码"
        bodyStyle={{
          paddingTop: 10,
          paddingBottom: 10,
        }}
        onCancel={() => {
          setShowQuerySql(false);
        }}
        footer={<></>}
      >
        <Card
          title="SQL语句"
          size="small"
          bordered={false}
          extra={
            <>
              {/* <Button
                type="text"
                icon={<ConsoleSqlOutlined />}
                onClick={() => {
                  if (embed) {
                    jumpToParent(
                      '/report/widget',
                      { embedUrl: `/embed/sql-lab?createsql=${props.sql}` },
                      false,
                    );
                  } else {
                    history.push(`/sql-lab?createsql=${props.sql}`);
                  }
                }}
              >
                SQL查询
              </Button> */}
              <CopyToClipboardWrap text={props.sql} />
            </>
          }
        >
          <pre style={{ fontSize: '10px', whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>
            {format(props.sql)}
          </pre>
        </Card>
        {/* <Card
          title="explain结果"
          size="small"
          bordered={false}
          extra={<CopyToClipboardWrap text={props.explain} />}
        >
          <pre style={{ fontSize: '10px', whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>
            {props.explain}
          </pre>
        </Card> */}
      </Modal>
      <Modal
        destroyOnClose
        width="80%"
        visible={showQueryData}
        title="查看查询数据"
        bodyStyle={{
          paddingTop: 10,
          paddingBottom: 10,
        }}
        onCancel={() => {
          setShowQueryData(false);
        }}
        footer={<></>}
      >
        <Table size="small" columns={columns} dataSource={props.queriesData}></Table>
      </Modal>
    </>
  );
};

export default ViewQuerySql;
