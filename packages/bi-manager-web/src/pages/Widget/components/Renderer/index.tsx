import { EVisualizationType, IReferenceResult } from '@bi/common';
import { FullscreenOutlined, MenuOutlined } from '@ant-design/icons';
import { ChartProperties, ITimeRange, IWidgetFormData } from '@bi/common';
import { Button, Card, Dropdown, Menu, MenuProps, Tooltip } from 'antd';
import AddToDashboard from './components/AddToDashboard';
import ViewQuerySql from './components/ViewQuerySql';
import Widget from './components/Widget';
import FullScreenCard from '@/components/FullScreenCard';
import { useState } from 'react';

/**
 * Widget 操作行为枚举
 */
export enum EWidgetActionKey {
  QuerySql = '查询语句',
  QueryData = '查询数据',
  AddToDashboard = '添加到仪表盘',
  FullScreen = '全屏展示',
}

export interface IWidgetRenderProps {
  widget: IWidgetFormData;
  /** 查询结果中返回的字段集合 */
  colNames: string[];
  /** 展示名称 */
  colIdList: string[];
  /** 标志线 */
  references?: IReferenceResult[];
  /** 数据查询结果 */
  queriesData: any;
  /** 配置转换后的 sql 代码 */
  sql?: string;
  /** sql 代码的执行计划 */
  explain?: string;
  /**
   * 是否显示标题
   * @default false
   */
  showName?: boolean;
  /**
   * 是否只返回纯净的图表部，去除所有的容器外层
   * @default false
   */
  pure?: boolean;
  widgetStyle?: ChartProperties;
  dicts: any;
  /** 提交函数 */
  submitFunc?: () => any;
  widgetId?: string;
  /** 覆盖时间 */
  time_range: ITimeRange;
  time_grain: '1m' | '5m' | '1h' | undefined;
}

export default function WidgetRender({
  widget,
  colNames,
  colIdList,
  references = [],
  queriesData,
  sql = '',
  explain = '',
  dicts = {},
  showName = false,
  pure = false,
  widgetStyle,
  submitFunc,
  widgetId,
  time_grain,
  time_range,
}: IWidgetRenderProps) {
  const { name } = widget;
  const [fullScreen, setFullScreen] = useState<boolean>(false);
  /** 处理菜单切换 */
  const handleMenuChange: MenuProps['onClick'] = ({ key }) => {
    // TODO: 其他的操作
  };
  const widgetContent = (
    <Widget
      {...{
        widgetStyle,
        widget,
        colNames,
        queriesData,
        showName,
        dicts,
        colIdList,
        references,
        time_grain,
        time_range,
      }}
    />
  );

  if (pure) {
    return widgetContent;
  }

  return (
    <Card
      {...(showName && name ? { title: name } : {})}
      size="small"
      style={{
        width: '100%',
        height: '100%',
      }}
      bordered={false}
      bodyStyle={{
        // 父容器高度 - Card title的高度
        height: 'calc(100% - 36px)',
      }}
      extra={
        <>
          <Tooltip title={'全屏展示'}>
            <Button
              type="link"
              onClick={() => {
                setFullScreen(true);
              }}
              style={{ marginRight: '10px' }}
              icon={<FullscreenOutlined />}
            ></Button>
          </Tooltip>
          <Dropdown
            trigger={['click']}
            overlay={
              <Menu onClick={handleMenuChange} style={{ width: 200 }} selectable={false}>
                <ViewQuerySql
                  sql={sql}
                  explain={explain}
                  colNames={
                    widget.viz_type === EVisualizationType.TimeHistogram
                      ? colNames.concat('TIMESTAMP')
                      : colNames
                  }
                  queriesData={queriesData}
                />
                <AddToDashboard
                  isCheckSaved={true}
                  submitFunc={submitFunc!}
                  createId={widgetId!}
                  mode="menu"
                  title={EWidgetActionKey.AddToDashboard}
                />
              </Menu>
            }
            placement="bottomRight"
          >
            <Button style={{ borderRadius: 0 }} icon={<MenuOutlined />}></Button>
          </Dropdown>
        </>
      }
    >
      {fullScreen ? (
        <FullScreenCard
          onClose={() => {
            setFullScreen(false);
          }}
          fullScreen={true}
        >
          {widgetContent}
        </FullScreenCard>
      ) : null}
      {widgetContent}
    </Card>
  );
}
