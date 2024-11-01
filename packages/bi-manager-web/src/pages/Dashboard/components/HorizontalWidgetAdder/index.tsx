import AutoWidthContainer from '@/components/AutoWidthContainer';
import AutoWidthContainerCard from '@/components/AutoWidthContainer/components/AutoWidthContainerCard';
import { queryAllWidgets } from '@/services';
import { IWidgetFormData } from '@bi/common';
import { Input, Space } from 'antd';
import cx from 'classnames';
import { useEffect, useMemo, useState } from 'react';
import AddWidgetCard from './components/AddWidgetCard';
import styles from './index.less';
import { CARD_HEIGHT, CARD_WIDTH } from '../HorizontalComponentAdder';

const HorizontalWidgetAdder = () => {
  // 当前 Dashboard 中已经存在的图表
  const [selectedSliceIdsSet, setSelectedSliceIdsSet] = useState<Set<string>>(new Set());
  // widget列表状态
  const [widgetList, setWidgetList] = useState<IWidgetFormData[]>([]);
  const [queryLoading, setQueryLoading] = useState<boolean>(true);

  // 过滤关键字
  const [keyword, setKeyword] = useState<string>();

  useEffect(() => {
    setQueryLoading(true);
    queryAllWidgets().then(({ data, success }) => {
      setQueryLoading(false);
      setWidgetList(success ? data : []);
    });
  }, []);

  const handleSearchChange = (e: any) => {
    setKeyword(e.target.value);
  };

  const filteredWidgets = useMemo(() => {
    if (!keyword) {
      return widgetList;
    }
    return widgetList.filter((el) => el.name.includes(keyword));
  }, [widgetList, keyword]);

  return (
    <div className={styles['widget-adder-container']}>
      <Input.Search placeholder='请输入图表名称' value={keyword} onChange={handleSearchChange} />
      <AutoWidthContainer cardHeight={CARD_HEIGHT}>
        {filteredWidgets.map((widget) => {
          const isSelected = selectedSliceIdsSet.has(widget.id!);
          return (
            <AutoWidthContainerCard cardWidth={CARD_WIDTH}>
              <div
                key={widget.id}
                draggable={true}
                unselectable="on"
                // this is a hack for firefox
                // Firefox requires some kind of initialization
                // which we can do by adding this attribute
                // @see https://bugzilla.mozilla.org/show_bug.cgi?id=568313
                // @see https://github.com/react-grid-layout/react-grid-layout/issues/1180#issuecomment-612812656
                onDragStart={(e) => e.dataTransfer.setData('text/plain', JSON.stringify(widget))}
                onDragEnd={(e) => {
                  e.stopPropagation();
                  e.dataTransfer.setData('text/plain', '');
                  e.dataTransfer.clearData('text/plain');
                }}
                className={cx(styles['chart-card'], { [styles['is-selected']]: isSelected })}
                style={{ height: '100%', width: '100%'}}
              >
                <AddWidgetCard widget={widget} style={{ height: '100%',width:'100%'}} />
              </div>
            </AutoWidthContainerCard>
          );
        })}
      </AutoWidthContainer>
    </div>
  );
};

export default HorizontalWidgetAdder;
