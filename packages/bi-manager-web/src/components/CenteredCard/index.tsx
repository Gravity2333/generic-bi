import { Card } from 'antd';
import styles from './index.less';
export default function CenteredCard({ children }: any) {
  return (
    <Card
      title={undefined}
      size="small"
      className={styles['outer-card']}
      bodyStyle={{ height: '100%' }}
    >
      {children}
    </Card>
  );
}
