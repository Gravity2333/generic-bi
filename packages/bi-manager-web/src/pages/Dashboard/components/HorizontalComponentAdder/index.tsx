import { Card, Input } from 'antd';
import cx from 'classnames';
import { v4 as uuidv4 } from 'uuid';
import styles from './index.less';
import { ECOMPONENTTYPE } from './typing';
import { ACTIVE_ASSETS_NAME } from './components/ActiveAssets';
import { NEW_FOUNDED_ASSETS_NAME } from './components/NewFoundedAssets';
import BUILTIN_NEW_FOUNDED_ASSETS from './assets/BUILTIN_NEW_FOUNDED_ASSETS.svg';
import BUILTIN_ACTIVEASSETS from './assets/BUILTIN_ACTIVEASSETS.svg';
import MULTISOURCECARD from './assets/MULTISOURCECARD.svg';
import TIME from './assets/TIME.svg';
import TABS from './assets/TABS.svg';
import RICHEDITOR from './assets/RICHEDITOR.svg';
import DIVIDER from './assets/DIVIDER.svg';
import TEXTDIVIDER from './assets/TEXTDIVIDER.svg';
import TEXT from './assets/TEXT.svg';
import AutoWidthContainer from '@/components/AutoWidthContainer';
import AutoWidthContainerCard from '@/components/AutoWidthContainer/components/AutoWidthContainerCard';
import ALARM from './assets/ALARM.svg';
import { useState } from 'react';
import { ALARM_NAME } from './components/Alarms';
import { EBIVERSION } from '@bi/common';
import useBiVersion from '@/hooks/useBiVersion';

export const CARD_HEIGHT = 260;
export const CARD_WIDTH = 300;
const ComponentCard = ({ name, title, icon }: { name: string; title: string; icon: any }) => {
  return (
    <AutoWidthContainerCard cardWidth={CARD_WIDTH}>
      <div
        key={uuidv4()}
        draggable={true}
        unselectable="on"
        // this is a hack for firefox
        // Firefox requires some kind of initialization
        // which we can do by adding this attribute
        // @see https://bugzilla.mozilla.org/show_bug.cgi?id=568313
        // @see https://github.com/react-grid-layout/react-grid-layout/issues/1180#issuecomment-612812656
        onDragStart={(e) => e.dataTransfer.setData('text/plain', name)}
        onDragEnd={(e) => {
          e.stopPropagation();
          e.dataTransfer.setData('text/plain', '');
          e.dataTransfer.clearData('text/plain');
        }}
        className={cx(styles['chart-card'])}
      >
        <Card
          key={uuidv4()}
          size="small"
          style={{ height: '300px', width: '300px' }}
          bodyStyle={{
            width: '100%',
            height: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
          title={title}
          bordered
          hoverable
        >
          {icon}
        </Card>
      </div>
    </AutoWidthContainerCard>
  );
};

const HorizontalComponentAdder = () => {
  const [searchName, setSearchName] = useState<string>('');
  const biVersion = useBiVersion();
  const componentInfoList = [
    {
      svg: TEXT,
      title: '文字',
      name: ECOMPONENTTYPE.TEXT,
    },
    {
      svg: DIVIDER,
      title: '分割线',
      name: ECOMPONENTTYPE.DIVIDER,
    },
    {
      svg: TEXTDIVIDER,
      title: '标题分割线',
      name: ECOMPONENTTYPE.TEXTDIVIDER,
    },
    {
      svg: RICHEDITOR,
      title: '富文本编辑器',
      name: ECOMPONENTTYPE.RICHEDITOR,
    },
    {
      svg: TABS,
      title: '标签页',
      name: ECOMPONENTTYPE.TABS,
    },
    {
      svg: TIME,
      title: '时间',
      name: ECOMPONENTTYPE.TIME,
    },
    {
      svg: MULTISOURCECARD,
      title: '多数据源卡片',
      name: ECOMPONENTTYPE.MULTISOURCECARD,
    },
    ...(() => {
      if (biVersion === EBIVERSION.NPMD) {
        return [
          {
            svg: BUILTIN_ACTIVEASSETS,
            title: ACTIVE_ASSETS_NAME,
            name: ECOMPONENTTYPE.BUILTIN_ACTIVEASSETS,
          },
          {
            svg: BUILTIN_NEW_FOUNDED_ASSETS,
            title: `${NEW_FOUNDED_ASSETS_NAME}[默认最近半小时]`,
            name: ECOMPONENTTYPE.BUILTIN_NEW_FOUNDED_ASSETS,
          },
          {
            svg: ALARM,
            title: `${ALARM_NAME}[默认最近半小时]`,
            name: ECOMPONENTTYPE.ALARM,
          },
        ];
      }
      return [];
    })(),
  ];
  return (
    <div style={{ margin: '10px 0px' }}>
      <Input.Search
        placeholder="请输入小组件名称"
        value={searchName}
        onChange={(e) => {
          setSearchName(e.target.value);
        }}
      />
      <AutoWidthContainer cardHeight={CARD_HEIGHT} style={{ overflowX: 'hidden' }}>
        {componentInfoList
          .filter((c) => c?.title?.includes(searchName))
          .map((c) => {
            return (
              <ComponentCard
                icon={<img draggable={false} src={c.svg} alt="" style={{ fontSize: '100px' }} />}
                title={c.title}
                name={c.name}
              />
            );
          })}
      </AutoWidthContainer>
    </div>
  );
};

export default HorizontalComponentAdder;
