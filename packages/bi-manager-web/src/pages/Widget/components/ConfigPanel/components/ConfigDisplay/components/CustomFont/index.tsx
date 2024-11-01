import { Checkbox, Slider } from 'antd';
import FormItem from 'antd/es/form/FormItem';

export default function CustomFont() {
  return (
    <>
      <FormItem valuePropName="checked" name="autoFontSize">
        <Checkbox defaultChecked={false}>自定义字号</Checkbox>
      </FormItem>
      <FormItem
        noStyle
        shouldUpdate={(prevValues, currentValues) =>
          prevValues.autoFontSize !== currentValues.autoFontSize
        }
      >
        {({ getFieldValue }) => {
          const autoFontSize = getFieldValue('autoFontSize');

          return (
            <FormItem label="字号大小" name="customFontSize" initialValue={12}>
              <Slider disabled={!autoFontSize} min={0} max={100} />
            </FormItem>
          );
        }}
      </FormItem>
    </>
  );
}
