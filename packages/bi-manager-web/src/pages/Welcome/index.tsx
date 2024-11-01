import { SmileOutlined } from '@ant-design/icons';
import { Result } from 'antd';

export default function Welcome() {
  return <Result icon={<SmileOutlined />} title={`欢迎使用Generic-BI`} />;
}
