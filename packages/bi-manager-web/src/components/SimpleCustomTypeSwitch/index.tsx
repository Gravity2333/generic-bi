import { Switch } from 'antd';
import { SwitchSize } from 'antd/lib/switch';
import { useEffect, useState } from 'react';

export function SimpleCustomTypeSwitch({
  size = 'small',
  value,
  onChange,
  onSwitch,
}: {
  size?: SwitchSize,
  value?: string;
  onChange?: (value: string) => void;
  onSwitch?: (value: boolean) => void;
}) {
  const [checked, setChecked] = useState<boolean>(value === 'simple');

  useEffect(() => {
    setChecked(value === 'simple');
  }, [value]);

  return (
    <Switch
      size={size}
      checkedChildren="简单"
      unCheckedChildren="自定义"
      checked={checked}
      onChange={(e) => {
        if (e) {
          setChecked(true);
          if (onChange) {
            onChange('simple');
          }
        } else {
          setChecked(false);
          if (onChange) {
            onChange('custom');
          }
        }
        if (onSwitch) {
          onSwitch(e);
        }
      }}
    />
  );
}
