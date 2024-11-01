import { Select } from 'antd';

const { Option } = Select;

enum ETimeGrain {
  '1Min' = '1m',
  '5M' = '5m',
  '1H' = '1h',

  '1D' = '1d',
  '1Mon' = '1M',
  '1Y' = '1Y',
}

export default function TimeGrainSelect({
  value,
  onChange,
}: {
  value?: string;
  onChange?: (value: string) => void;
}) {
  return (
    <Select
      value={value}
      style={{ width: '100%' }}
      placeholder="请选择时间粒度"
      onChange={onChange}
    >
      <Option value={ETimeGrain['1Min']}>1分钟</Option>
      <Option value={ETimeGrain['5M']}>5分钟</Option>
      <Option value={ETimeGrain['1H']}>1小时</Option>
{/* 
      <Option value={ETimeGrain['1D']}>1天</Option>
      <Option value={ETimeGrain['1Mon']}>1个月</Option>
      <Option value={ETimeGrain['1Y']}>1年</Option> */}
    </Select>
  );
}
