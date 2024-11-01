import { queryHasOnlineSnesor } from '@/services/dataset';
import { Alert } from 'antd';
import { useEffect } from 'react';

export function SensorOfflineAlert({
  hasOnlineSensor = false,
  setHasOnlinenSensor,
  hide = false,
}: {
  hasOnlineSensor: boolean;
  setHasOnlinenSensor: (value: boolean) => void;
  hide?: boolean;
}) {
  /** 查询可用探针 */
  useEffect(() => {
    (async () => {
      const { success, data } = await queryHasOnlineSnesor();
      if (success) {
        if ((data as any)?.online === true) {
          setHasOnlinenSensor(true);
        } else {
          setHasOnlinenSensor(false);
        }
      } else {
        setHasOnlinenSensor(false);
      }
    })();
  }, []);

  if (hide) {
    return null;
  }

  if (!hasOnlineSensor) {
    return (
      <Alert
        message="无可用在线探针，图表预览编辑等功能无法使用!"
        type="info"
        showIcon
        style={{ margin: '10px' }}
      />
    );
  }
  return null;
}
