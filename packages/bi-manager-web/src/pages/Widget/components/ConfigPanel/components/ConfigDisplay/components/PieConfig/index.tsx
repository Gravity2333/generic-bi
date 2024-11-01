import {
  Card,
  Checkbox,
  Collapse,
  Divider,
  InputNumber,
  Select,
  Slider,
  Space,
  Switch,
} from 'antd';
import FormItem from 'antd/es/form/FormItem';
import React, { useEffect, useImperativeHandle } from 'react';
import LegendPosSelector from '../LegendPosSelector';
import CustomFont from '../CustomFont';
import SchemeColor from '../SchemeColor';
import { ELegendPosition, LegendPosDict } from '@bi/common';

const { Panel } = Collapse;

const LABEL_DISPLAY_TYPE = [
  {
    name: '不展示',
    value: 'label_show_hide',
  },
  {
    name: '外侧展示',
    value: 'label_show_outside',
  },
  {
    name: '居中展示',
    value: 'label_show_center',
  },
  {
    name: '隐藏Label Line',
    value: 'label_line_hide',
  },
];

function PieConfig(
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
        legend,
        tooltip,
        threshold,
        series,
        color,
        isColorRange,
        colorRange,
        auto_size,
        custom_font_size,
        top_filter,
        isTopFilter,
      } = defaultValues;

      /** pie类型时初始化 */
        if (series) {
          /** 初始化是否展示内环 */
          const donut = series.radius[0];
          /** 初始化label展示类型 */
          const { labelLine, label } = series;
          let show_label = (() => {
            if (labelLine?.show === false) {
              return 'label_line_hide';
            } else if (label?.position) {
              return 'label_show_center';
            } else if (label?.show) {
              return 'label_show_outside';
            } else {
              return 'label_show_hide';
            }
          })();
  
          form.setFieldsValue({
            inner_radius: donut ? parseInt(series.radius[0]) : undefined,
            outer_radius: parseInt(series.radius[1]),
            show_label: show_label,
            donut: donut,
            legend: legend?.show !== false,
            legendType: legend?.type,
            legendPosition: legend?.legendPosition || ELegendPosition.BOTTOM,
            autoFontSize: auto_size,
            customFontSize: custom_font_size,
            isColorRange: isColorRange,
            colorRange: colorRange,
            topFilter: top_filter,
            isTopFilter: isTopFilter,
            tooltip: tooltip,
            threshold: threshold,
            color: JSON.stringify(color)||'[]',
          });
        }
  };

  // 命令式的给`ref.current`赋值个对象
  useImperativeHandle(ref, () => ({
    submit: async () => {
      return await new Promise((resolve, reject) => {
        form
          .validateFields()
          .then((values: any) => {
            const {
              legend,
              legendType,
              legendPosition,
              autoFontSize,
              customFontSize,
              isColorRange,
              colorRange,
              donut,
              topFilter,
              isTopFilter,
              tooltip,
              threshold,
              outer_radius,
              inner_radius,
              show_label,
              color,
            } = values;
            resolve({
              legend: legend
                ? {
                    type: legendType,
                    legendPosition,
                    //@ts-ignore
                    ...(LegendPosDict[legendPosition] || {}),
                    textStyle: {
                      fontSize: autoFontSize && customFontSize,
                      color: '#999999',
                    },
                  }
                : {
                    show: false,
                  },
              color: color ? JSON.parse(color) || [] : undefined,
              isColorRange,
              colorRange,
              threshold,
              auto_size: autoFontSize,
              custom_font_size: customFontSize,
              series: {
                radius: donut ? [`${inner_radius}%`, `${outer_radius}%`] : [, `${outer_radius}%`],
                label: {
                  show: show_label !== 'label_show_hide',
                  ...(() => {
                    if (show_label === 'label_show_center' && show_label !== 'label_line_hide') {
                      return {
                        position: 'center',
                      };
                    }
                  })(),
                },
                labelLine: {
                  show: show_label !== 'label_line_hide',
                },
              },
              isTopFilter: isTopFilter,
              top_filter: isTopFilter?topFilter:-1,
              tooltip: tooltip
                ? {
                    trigger: 'item',
                  }
                : {
                    trigger: 'false',
                  },
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
      <Collapse defaultActiveKey={['shape']}>
        <Panel header="饼图形状" key="shape">
          <FormItem name="outer_radius" label="外圈半径" initialValue={50}>
            <Slider />
          </FormItem>
          <FormItem valuePropName="checked" name="donut" initialValue={false}>
            <Checkbox>内环</Checkbox>
          </FormItem>
          <FormItem
            noStyle
            shouldUpdate={(prevValues, currentValues) => prevValues.donut !== currentValues.donut}
          >
            {({ getFieldValue }) => {
              const donut = getFieldValue('donut');
              if (donut) {
                return (
                  <FormItem name="inner_radius" label="内圈半径" initialValue={25}>
                    <Slider />
                  </FormItem>
                );
              }
            }}
          </FormItem>
        </Panel>
      </Collapse>
      <Divider orientation="left">展示</Divider>
      <FormItem name="legend" valuePropName="checked" initialValue={true}>
        <Checkbox>图例</Checkbox>
      </FormItem>
      <FormItem
        noStyle
        shouldUpdate={(prevValues, currentValues) => prevValues.legend !== currentValues.legend}
      >
        {({ getFieldValue, setFieldValue }) => {
          if (getFieldValue('legend')) {
            return (
              <Card size="small" title="图例配置" style={{ marginBottom: '20px' }}>
                <FormItem name="legendType" initialValue={'scroll'}>
                  <Switch
                    checkedChildren="平铺"
                    unCheckedChildren="滚动"
                    checked={getFieldValue('legendType') === 'plain'}
                    onChange={(e) => {
                      setFieldValue('legendType', e ? 'plain' : 'scroll');
                    }}
                  ></Switch>
                </FormItem>
                <div>
                  <LegendPosSelector />
                </div>
              </Card>
            );
          }
        }}
      </FormItem>
      <FormItem name="tooltip" valuePropName="checked" initialValue={true}>
        <Checkbox>数值提示</Checkbox>
      </FormItem>
      <CustomFont />
      <SchemeColor />
      <FormItem style={{marginTop:'20px'}} name="show_label" label="Label展示" initialValue={'label_show_outside'}>
        <Select >
          {LABEL_DISPLAY_TYPE.map((type) => (
            <Select.Option value={type.value} key={type.value}>
              {type.name}
            </Select.Option>
          ))}
        </Select>
      </FormItem>
      <Divider orientation="left">过滤</Divider>
      <FormItem name="threshold" label="百分比阀值" initialValue={0}>
        <InputNumber
          style={{ width: '100%' }}
          defaultValue={0}
          min={0}
          max={100}
          formatter={(value) => `${value}%`}
        ></InputNumber>
      </FormItem>
      <Space>
        <FormItem name="isTopFilter" noStyle valuePropName="checked">
          <Checkbox style={{ marginBottom: '20px' }}>TOP N 过滤</Checkbox>
        </FormItem>
        <FormItem
          noStyle
          shouldUpdate={(prevValues, currentValues) =>
            prevValues.topFilter !== currentValues.topFilter
          }
        >
          {({ getFieldValue }) => {
            const topFilter = getFieldValue('isTopFilter');
            if (topFilter) {
              return (
                <FormItem name="topFilter">
                  <InputNumber style={{ width: '100%' }} min={0}></InputNumber>
                </FormItem>
              );
            }
          }}
        </FormItem>
      </Space>
    </>
  );
}

export default React.forwardRef(PieConfig);
