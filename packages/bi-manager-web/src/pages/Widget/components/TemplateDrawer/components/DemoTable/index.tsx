import { Table } from 'antd';
import styles from './index.less';

export default function DemoTable({ datas = [[], []] }: { datas: [any[], any[]] }) {
  return (
    <div className={styles['small_table']}>
      <Table
        style={{ cursor: 'pointer', userSelect: 'none', width: '100%' }}
        size="small"
        bordered
        pagination={false}
        columns={datas[0]}
        dataSource={datas[1] as any}
      />
    </div>
  );
}
