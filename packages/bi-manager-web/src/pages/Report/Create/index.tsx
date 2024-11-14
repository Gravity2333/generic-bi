import { Card } from 'antd';
import ReportForm from '../components/ReportForm';
import styles from './index.less';
import CenteredCard from '@/components/CenteredCard';

export default function Create() {
  return (
    <CenteredCard>
      <ReportForm type="create" />
    </CenteredCard>
  );
}
