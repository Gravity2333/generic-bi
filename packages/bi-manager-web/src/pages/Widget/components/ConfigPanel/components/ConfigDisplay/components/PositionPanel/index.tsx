import { Collapse, Slider } from 'antd';
import FormItem from 'antd/es/form/FormItem';

const { Panel } = Collapse;

export default function PositionPanel() {
  return (
    <Collapse defaultActiveKey={['position']}>
      <Panel header="图表定位" key="position">
        <FormItem name="grid_x" label="左边框距离">
          <Slider min={0} max={300} />
        </FormItem>
        <FormItem name="grid_y" label="上边框距离">
          <Slider min={0} max={300} />
        </FormItem>
        <FormItem name="grid_x2" label="右边框距离">
          <Slider min={0} max={300} />
        </FormItem>
        <FormItem name="grid_y2" label="下边框距离">
          <Slider min={0} max={300} />
        </FormItem>
      </Panel>
    </Collapse>
  );
}
