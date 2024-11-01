import { Checkbox, Divider, Select, Slider } from 'antd';
import FormItem from 'antd/lib/form/FormItem';
import React, { useEffect, useImperativeHandle } from 'react';
import CustomFont from '../CustomFont';

function TableConfig(
  {
    defaultValues,
    form,
  }: {
    defaultValues: any;
    form: any;
  },
  ref: any,
) {
  const init = () => {
    const { pagination, custom_font_size, column_padding, size, auto_resize,auto_font_size } = defaultValues;

    form.setFieldsValue({
      pagination: !!pagination,
      page_size: pagination?.pageSize,
      table_size: size || 'small',
      autoResize: auto_resize || false,
      columnPadding: column_padding !== undefined ? column_padding : 10,
      autoFontSize: auto_font_size,
      customFontSize: custom_font_size,
    });
  };

  // 命令式的给`ref.current`赋值个对象
  useImperativeHandle(ref, () => ({
    submit: () => {
      return form
        .validateFields()
        .then((values: any) => {
          const { pagination, table_size, autoResize, columnPadding, autoFontSize,customFontSize } = {
            ...defaultValues,
            ...values,
            pagination: values?.pagination
              ? {
                  pageSize: values.page_size || defaultValues?.pagination?.pageSize,
                  pageSizeOptions: undefined,
                }
              : false,
          } as any;

          return {
            pagination,
            size: table_size,
            auto_resize: autoResize,
            column_padding: columnPadding,
            auto_font_size: autoFontSize,
            custom_font_size: customFontSize,
          };
        })
        .catch(() => {
          return null;
        });
    },
  }));

  useEffect(() => {
    init();
  }, []);

  return (
    <>
      <Divider orientation="left">分页</Divider>
      <FormItem name="pagination" valuePropName="checked" initialValue={false}>
        <Checkbox>分页</Checkbox>
      </FormItem>
      <FormItem
        noStyle
        shouldUpdate={(prevValues, currentValues) =>
          prevValues.pagination !== currentValues.pagination
        }
      >
        {({ getFieldValue }) => {
          const pagination = getFieldValue('pagination');
          if (pagination) {
            return (
              <FormItem name="page_size" label="默认分页大小" initialValue={10}>
                <Select style={{width:'100px'}} suffixIcon={<>条/页</>}>
                  {[10, 20, 50, 100].map((size) => (
                    <Select.Option key={size} value={size}>
                      {size}
                    </Select.Option>
                  ))}
                </Select>
              </FormItem>
            );
          }
        }}
      </FormItem>
      <Divider orientation="left">列配置</Divider>
      <FormItem
        style={{ marginBottom: '30px' }}
        label="列边距"
        name="columnPadding"
        initialValue={10}
      >
        <Slider min={0} max={50} />
      </FormItem>
      <FormItem
        style={{ marginBottom: '60px' }}
        valuePropName="checked"
        name="autoResize"
        initialValue={false}
      >
        <Checkbox>自动计算列宽</Checkbox>
      </FormItem>
      <Divider orientation="left">字体</Divider>
      <CustomFont />
    </>
  );
}

export default React.forwardRef(TableConfig);
