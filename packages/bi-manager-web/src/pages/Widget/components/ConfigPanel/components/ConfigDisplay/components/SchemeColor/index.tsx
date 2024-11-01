import { Card, Select, Switch } from 'antd';
import FormItem from 'antd/es/form/FormItem';
import RangeColorSelector from '../../../RangeColorSelector';
import { SCHEME_COLOR_LIST } from '../../../../dict';
import { useContext } from 'react';
import { ConfigDisplayContext } from '../..';

export default function SchemeColor() {
  const { forceRefresh } = useContext(ConfigDisplayContext);
  return (
    <Card
      title="配色"
      size="small"
      extra={
        <FormItem name="isColorRange" valuePropName="checked">
          <Switch
            checkedChildren="配色方案"
            unCheckedChildren="配色范围"
          ></Switch>
        </FormItem>
      }
    >
      <FormItem
        noStyle
        shouldUpdate={(prevValues, currentValues) =>
          prevValues.isColorRange !== currentValues.isColorRange
        }
      >
        {({ getFieldValue, setFieldValue }) => {
          if (getFieldValue('isColorRange')) {
            return (
              <>
                <FormItem
                  noStyle
                  shouldUpdate={(prevValues, currentValues) =>
                    prevValues.colorRange !== currentValues.colorRange
                  }
                >
                  {() => {
                    const colorRange = getFieldValue('colorRange') || ['#e6f7ff', '#40a9ff'];
                    return (
                      <>
                        <FormItem name="colorRange">
                          <RangeColorSelector
                            range={colorRange}
                            setRange={(e) => {
                              setFieldValue('colorRange', JSON.parse(JSON.stringify([...e])));
                              forceRefresh();
                            }}
                          />
                        </FormItem>
                      </>
                    );
                  }}
                </FormItem>
              </>
            );
          } else {
            return (
              <FormItem name="color" initialValue={JSON.stringify(SCHEME_COLOR_LIST[0])}>
                <Select style={{ width: '100%' }}>
                  {SCHEME_COLOR_LIST.map((scheme) => {
                    return (
                      <Select.Option
                        key={JSON.stringify(scheme)}
                        value={JSON.stringify(scheme)}
                        style={{ display: 'flex' }}
                      >
                        {scheme.map((color) => {
                          return (
                            <div
                              key={color}
                              style={{
                                display: 'inline-block',
                                width: '15px',
                                height: '15px',
                                border: '1px solid black',
                                backgroundColor: color,
                                marginTop: '8px',
                                marginRight: '2px',
                              }}
                            />
                          );
                        })}
                      </Select.Option>
                    );
                  })}
                </Select>
              </FormItem>
            );
          }
        }}
      </FormItem>
    </Card>
  );
}
