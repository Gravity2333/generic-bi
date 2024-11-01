import { Card, Checkbox, Input, Select, Slider } from 'antd';
import FormItem from 'antd/lib/form/FormItem';
import React, { useEffect, useImperativeHandle } from 'react';
import { FONT_FAMILY_LIST } from '../../../../dict';

function BigNumberConfig(
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
    const {
      font_family,
      show_title,
      auto_size,
      title_font_size,
      value_font_size,
      click_font,
      font_jump_url,
    } = defaultValues;

    form.setFieldsValue({
      autoFontSize: auto_size,
      showFontTitle: show_title,
      valueFontSize: value_font_size,
      titleFontSize: title_font_size,
      font_family: font_family || 'Lucida Console',
      fontClickable: click_font,
      fontJumpUrl: font_jump_url,
    });
  };

  // 命令式的给`ref.current`赋值个对象
  useImperativeHandle(ref, () => ({
    submit: async () => {
      return await new Promise((resolve, reject) => {
        form
          .validateFields()
          .then((values: any) => {
            const {
              autoFontSize,
              showFontTitle,
              valueFontSize,
              titleFontSize,
              font_family,
              fontClickable,
              fontJumpUrl,
            } = values;
            resolve({
              font_family,
              title_font_size: titleFontSize,
              value_font_size: valueFontSize,
              show_title: showFontTitle,
              auto_size: autoFontSize,
              click_font: fontClickable,
              font_jump_url: fontJumpUrl,
            });
          })
          .catch(() => {
            reject({});
          });
        return;
      });
    },
  }));

  useEffect(() => {
    init();
  }, []);

  return (
    <>
      <FormItem name="font_family" label="字体样式" initialValue={'Lucida Console'}>
        <Select style={{width:'100%'}}>
          {FONT_FAMILY_LIST.map((font) => {
            return (
              <Select.Option key={font} value={font} style={{ fontFamily: font }}>
                {font}
              </Select.Option>
            );
          })}
        </Select>
      </FormItem>
      <FormItem name="showFontTitle" valuePropName="checked" initialValue={true}>
        <Checkbox>显示标题</Checkbox>
      </FormItem>
      <FormItem name="autoFontSize" valuePropName="checked" initialValue={true}>
        <Checkbox>自动调整字号</Checkbox>
      </FormItem>
      <FormItem
        noStyle
        shouldUpdate={(prevValues, currentValues) =>
          prevValues.autoFontSize !== currentValues.autoFontSize
        }
      >
        {({ getFieldValue }) => {
          const autoFontSize = getFieldValue('autoFontSize');
          if (!autoFontSize) {
            return (
              <Card title={'字体大小'} style={{ marginBottom: '20px' }}>
                <FormItem
                  noStyle
                  shouldUpdate={(prevValues, currentValues) =>
                    prevValues.showFontTitle !== currentValues.showFontTitle
                  }
                >
                  {() => {
                    const showFontTitle = getFieldValue('showFontTitle');
                    if (showFontTitle) {
                      return (
                        <FormItem label="标题(%)" name="titleFontSize" initialValue={50}>
                          <Slider min={0} max={100} />
                        </FormItem>
                      );
                    }
                  }}
                </FormItem>

                <FormItem label="数值(%)" name="valueFontSize" initialValue={50}>
                  <Slider min={0} max={100} />
                </FormItem>
              </Card>
            );
          }
        }}
      </FormItem>
      <FormItem name="fontClickable" valuePropName="ckecked" initialValue={false}>
        <Checkbox>跳转</Checkbox>
      </FormItem>
      <FormItem
        noStyle
        shouldUpdate={(prevValues, currentValues) =>
          prevValues.fontClickable !== currentValues.fontClickable
        }
      >
        {({ getFieldValue }) => {
          const fontClickable = getFieldValue('fontClickable');
          if (fontClickable) {
            return (
              <FormItem label="跳转路径" name="fontJumpUrl" initialValue={''}>
                <Input />
              </FormItem>
            );
          }
        }}
      </FormItem>
    </>
  );
}
export default React.forwardRef(BigNumberConfig);
