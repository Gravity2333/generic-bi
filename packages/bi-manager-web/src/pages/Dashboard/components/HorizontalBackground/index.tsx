import { Card, Input } from 'antd';
import cx from 'classnames';
import { v4 as uuidv4 } from 'uuid';
import styles from './index.less';
import { BACKGROUND_TYPE_LABEL, EBACKGROUNDTYPE } from './typing';
import AutoWidthContainer from '@/components/AutoWidthContainer';
import AutoWidthContainerCard from '@/components/AutoWidthContainer/components/AutoWidthContainerCard';
import { useState } from 'react';
import { GET_SEL_CARD_CLASSNAME } from '@/utils/layout';

export const CARD_HEIGHT = 260;
export const CARD_WIDTH = 300;
const ComponentCard = ({
  title,
  onClick,
  content,
}: {
  content: any;
  title: string;
  onClick: any;
}) => {
  return (
    <AutoWidthContainerCard cardWidth={CARD_WIDTH}>
      <div
        key={uuidv4()}
        draggable={false}
        unselectable="on"
        onClick={onClick}
        className={cx(styles['chart-card'])}
      >
        <Card
          key={uuidv4()}
          size="small"
          style={{ height: '300px', width: '300px', margin: '10px' }}
          bodyStyle={{
            width: '100%',
            height: '100%',
            padding: '0px',
          }}
          title={title}
          bordered
          hoverable
        >
          {content}
        </Card>
      </div>
    </AutoWidthContainerCard>
  );
};

const HorizontalComponentAdder = ({ setBackground }: { setBackground: any }) => {
  const [searchName, setSearchName] = useState<string>('');
  const componentInfoList = Object.keys(BACKGROUND_TYPE_LABEL).map((type) => {
    const name = BACKGROUND_TYPE_LABEL[type as any];
    return {
      content: <div style={{height:'100%'}} className={GET_SEL_CARD_CLASSNAME(type as any)}></div>,
      title: name,
      name: type,
      onClick: () => {
        setBackground(type);
      },
    };
  });
  return (
    <div style={{ margin: '10px 0px' }}>
      <Input.Search
        placeholder="搜索背景"
        value={searchName}
        onChange={(e) => {
          setSearchName(e.target.value);
        }}
      />
      <AutoWidthContainer cardHeight={CARD_HEIGHT} style={{ overflowX: 'hidden' }}>
        {componentInfoList
          .filter((c) => c?.title?.includes(searchName))
          .map((c) => {
            return <ComponentCard onClick={c.onClick} content={c.content} title={c.title} />;
          })}
      </AutoWidthContainer>
    </div>
  );
};

export default HorizontalComponentAdder;
