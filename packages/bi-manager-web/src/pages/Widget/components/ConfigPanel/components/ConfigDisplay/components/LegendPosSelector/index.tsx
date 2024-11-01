import { ELegendPosition } from '@bi/common';
import { Radio } from 'antd';
import FormItem from 'antd/es/form/FormItem';

export default function LegendPosSelector() {
  return (
    <FormItem name="legendPosition" label='图例位置' initialValue={ELegendPosition.BOTTOM}>
      <Radio.Group>
        <Radio value={ELegendPosition.LEFT}>左侧</Radio>
        <Radio value={ELegendPosition.BOTTOM}>底部</Radio>
        <Radio value={ELegendPosition.RIGHT}>右侧</Radio>
        <Radio value={ELegendPosition.TOP}>顶部</Radio>
      </Radio.Group>
    </FormItem>
  );
}
