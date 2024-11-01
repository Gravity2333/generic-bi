import { SettingTwoTone } from '@ant-design/icons';
import { Button, Checkbox, Divider, Dropdown, Menu, Space, Tooltip } from 'antd';
import type { CheckboxChangeEvent } from 'antd/lib/checkbox';
import type { CheckboxValueType } from 'antd/lib/checkbox/Group';
import type { MutableRefObject } from 'react';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

export interface ICheckboxOption {
  label: string;
  value: string;
  disabled?: boolean;
}
interface ICheckboxMenuProps {
  options: ICheckboxOption[];
  onChange: (options: string[]) => void;
  value: string[];
  /** 菜单支持将列重置为resetValues */
  resetValues: MutableRefObject<string[] | undefined>;
}

const CheckboxMenu: React.FC<ICheckboxMenuProps> = ({ options, onChange, value, resetValues }) => {
  // 根据选项初始化
  const [visible, setVisible] = useState<boolean>(false);

  const [columnCache, setColumnCache] = useState<string[]>(value);

  const [maxItemWidth, setMaxItemWidth] = useState(200);

  // useEffect(() => {
  //   setColumnCache(value);
  // }, [value]);

  const optionsGroup = useMemo(() => {
    const fixed: ICheckboxOption[] = [];
    const canBeSelected: ICheckboxOption[] = [];
    options.forEach((option) => {
      if (option.disabled) {
        fixed.push(option);
      } else {
        canBeSelected.push(option);
      }
    });
    return {
      fixed,
      canBeSelected,
    };
  }, [options]);

  const ListRef = useRef<HTMLDivElement>(null);

  const [allCanBeSelectedItemsHeight, setAllCanBeSelectedItemsHeight] = useState(0);
  const [allCanBeSelectedItemsMaxHeight, setAllCanBeSelectedItemsMaxHeight] = useState(0);

  const handleResize = useCallback(() => {
    setAllCanBeSelectedItemsHeight(
      window.innerHeight - (ListRef.current?.getBoundingClientRect().top || 0) - 150,
    );
  }, [ListRef]);

  useEffect(() => {
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [handleResize]);

  useEffect(() => {
    const widthArrs: number[] = [];
    options.forEach((item) => {
      const textWidth = 70 + item.label?.length * 14;
      widthArrs.push(textWidth);
    });
    const allArrsHeight: number = optionsGroup.canBeSelected.length * 22;
    setAllCanBeSelectedItemsMaxHeight(allArrsHeight + 10);
    // 30 + 6 * 16表示'自定义显示列' 所需要的宽度
    setMaxItemWidth(Math.max(...widthArrs, 70 + 6 * 12));
  }, [options, optionsGroup.canBeSelected.length]);

  const handleVisibleChange = (nextVisible: boolean) => {
    setVisible(nextVisible);
  };

  const handleAllSelect = (e: CheckboxChangeEvent) => {
    setColumnCache(
      e.target.checked
        ? options.map((item) => item.value)
        : optionsGroup.fixed.map((item) => item.value),
    );
  };

  const handleChange = (list: CheckboxValueType[]) => {
    setColumnCache(optionsGroup.fixed.map((item) => item.value).concat(list as string[]));
  };

  const handleColumnChange = (values?: string[]) => {
    onChange(values || columnCache);
    setVisible(false);
  };

  const checkAll = useMemo(() => {
    return columnCache.length === options.length;
  }, [options.length, columnCache.length]);

  const indeterminate = useMemo(() => {
    return !!columnCache.length && columnCache.length < options.length;
  }, [options.length, columnCache.length]);

  const resetColumns = () => {
    const res = resetValues.current || options.map((item) => item.value);
    setColumnCache(res);
    handleColumnChange(res);
  };

  const ColumnSettingMenu = (
    <Menu selectable={true}>
      <Checkbox.Group
        style={{ width: '100%', padding: '5px 12px', maxHeight: 100 }}
        options={optionsGroup.fixed}
        value={columnCache}
      />
      <Divider style={{ margin: '1px' }} />
      <Menu.Item key="all">
        <Checkbox checked={checkAll} onChange={handleAllSelect} indeterminate={indeterminate}>
          自定义显示列
        </Checkbox>
      </Menu.Item>
      <Divider style={{ margin: '1px' }} />
      <div ref={ListRef} />
      <Checkbox.Group
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          padding: '5px 12px',
          maxHeight: allCanBeSelectedItemsMaxHeight,
          minHeight: 100,
          height: allCanBeSelectedItemsHeight,
          overflowY: 'auto',
        }}
        options={optionsGroup.canBeSelected}
        value={columnCache}
        onChange={handleChange}
      />
      <Divider style={{ margin: '1px' }} />
      <Space key="sure" style={{ padding: '5px 12px' }}>
        <Button
          onClick={() => {
            handleColumnChange();
          }}
          size="small"
          type="primary"
        >
          确认
        </Button>
        <Tooltip title="将表格重置为默认列">
          <Button onClick={resetColumns} size="small" type="text">
            重置
          </Button>
        </Tooltip>
      </Space>
    </Menu>
  );

  return (
    <Dropdown
      overlay={ColumnSettingMenu}
      trigger={['click']}
      visible={visible}
      onVisibleChange={handleVisibleChange}
      overlayStyle={{
        //菜单宽度
        width: maxItemWidth || 200,
        //菜单最大高度
        // maxHeight: MAX_DROP_DOWN_HEIGHT,
        //菜单最小宽度
        minHeight: 200,
        //菜单现在的宽度
        // height: settingheight,
      }}
    >
      <Button type="primary" icon={<SettingTwoTone />} />
    </Dropdown>
  );
};

export default CheckboxMenu;
