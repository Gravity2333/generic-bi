import { Card, Popover } from 'antd';
import HorizontalWidgetAdder from '../HorizontalWidgetAdder';
import styles from './index.less';
import HorizontalComponentAdder from '../HorizontalComponentAdder';
import { useState } from 'react';
import { DownSquareOutlined, UpSquareOutlined } from '@ant-design/icons';
import HorizontalBackground from '../HorizontalBackground';

enum ETabTitle {
  'WIDGET' = 'widget',
  'COMPONENT' = 'compoent',
  'BACKGROUND' = 'BACKGROUND',
}

const HorizontalComponentPane = ({setBackground}: {setBackground: any}) => {
  const [activeKey, setActiveKey] = useState<string>(ETabTitle.WIDGET);
  const [hide, setHide] = useState<boolean>(false);
  const tabList = [
    {
      key: ETabTitle.WIDGET,
      tab: '图表',
    },
    {
      key: ETabTitle.COMPONENT,
      tab: '小组件',
    },
    {
      key: ETabTitle.BACKGROUND,
      tab: '背景',
    },
  ];

  return (
    <>
      <Card
        className={styles.viewport}
        tabList={tabList}
        activeTabKey={activeKey}
        onTabChange={(key) => setActiveKey(key)}
        bodyStyle={{ padding: '0px' }}
        tabBarExtraContent={
          hide ? (
            <Popover key={`${hide}`} content={'展开配置面板'} title={undefined} trigger="hover">
              <UpSquareOutlined
                className={styles.hideButton}
                onClick={() => {
                  setHide(false);
                }}
              />
            </Popover>
          ) : (
            <Popover key={`${hide}`} content={'折叠配置面板'} title={undefined} trigger="hover">
              <DownSquareOutlined
                className={styles.hideButton}
                onClick={() => {
                  setHide(true);
                }}
              />
            </Popover>
          )
        }
      >
        {!hide ? (
          activeKey === ETabTitle.WIDGET ? (
            <HorizontalWidgetAdder />
          ) : activeKey === ETabTitle.COMPONENT ? (
            <HorizontalComponentAdder />
          ) : activeKey === ETabTitle.BACKGROUND ? (
            <HorizontalBackground setBackground={setBackground}/>
          ) : (
            ''
          )
        ) : (
          ''
        )}
      </Card>
      <div style={{ height: hide ? '58px' : `${420}px` }} />
    </>
  );
};

export default HorizontalComponentPane;
