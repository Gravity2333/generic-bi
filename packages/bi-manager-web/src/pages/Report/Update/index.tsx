import { Card } from 'antd';
import ReportForm from '../components/ReportForm';
import styles from './index.less';
import CenteredCard from '@/components/CenteredCard';

export default function Update() {
  return (
    <CenteredCard>
      <ReportForm type="update" />
    </CenteredCard>
  );
}
