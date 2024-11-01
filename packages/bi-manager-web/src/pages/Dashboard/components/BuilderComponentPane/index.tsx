import { Tabs } from 'antd';
import WidgetAdder from '../WidgetAdder';
import ComponentAdder from '../ComponentAdder';
import styles from './index.less';

const { TabPane } = Tabs;

const BuilderComponentPane = () => {
  return (
    <div className={styles.viewport}>
      <Tabs defaultActiveKey="widget">
        <TabPane tab="图表" key="widget">
          <WidgetAdder />
        </TabPane>
        <TabPane tab="小组件" key="components">
          <ComponentAdder />
        </TabPane>
      </Tabs>
    </div>
  );
};

export default BuilderComponentPane;
