import { useContext } from 'react';
import { ConfigPanelContext } from '../../../..';
import { Alert } from 'antd';

export default function ColumnModeAlert({title="新增聚合会清空当前表格展示列配置！"}: {title?: string}) {
  const { isColumnMode } = useContext(ConfigPanelContext);
  return isColumnMode ? (
    <Alert banner style={{
        fontSize:'12px',
        marginBottom:'10px',
    }} message={title} type="warning" showIcon closable={false} />
  ) : (
    <></>
  );
}
