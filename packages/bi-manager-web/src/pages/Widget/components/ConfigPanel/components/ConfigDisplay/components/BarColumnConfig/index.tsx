import { ELegendPosition, EVisualizationType, LegendPosDict } from '@bi/common';
import React, { useEffect, useImperativeHandle } from 'react';
import PositionPanel from '../PositionPanel';
import { Card, Checkbox, Divider, Input, Select, Switch } from 'antd';
import FormItem from 'antd/es/form/FormItem';
import LegendPosSelector from '../LegendPosSelector';
import SchemeColor from '../SchemeColor';
import CustomFont from '../CustomFont';
import { DEFAULT_SCHEME_COLOR } from '../../../../dict';

function BarColumnConfig(
  {
    defaultValues,
    form,
    type,
  }: {
    defaultValues: any;
    form: any;
    type: EVisualizationType.Bar | EVisualizationType.Column;
  },
  ref: any,
) {
  const init = () => {
    const { x, y, x2, y2 } = defaultValues.grid || {};
    const {
      legend,
      is_stack,
      yAxis,
      xAxis,
      color,
      isColorRange,
      colorRange,
      auto_size,
      custom_font_size,
      show_bar_value,
    } = defaultValues;
    form.setFieldsValue({
      color: JSON.stringify(color || DEFAULT_SCHEME_COLOR),
      grid_x: parseInt(x || 50),
      grid_y: parseInt(y || 50),
      grid_x2: parseInt(x2 || 50),
      grid_y2: parseInt(y2 || 50),
      y_axis_name: yAxis?.name,
      x_axis_name: xAxis?.name,
      x_axis_label_rotate: xAxis?.axisLabel?.rotate,
      y_axis_label_rotate: yAxis?.axisLabel?.rotate,
      legend: legend?.show !== false,
      legendType: legend?.type,
      colorRange: colorRange || ['#e6f7ff', '#40a9ff'],
      isColorRange: isColorRange,
      legendPosition: legend?.legendPosition || ELegendPosition.BOTTOM,
      autoFontSize: auto_size,
      customFontSize: custom_font_size,
      showBarValue: show_bar_value,
      isStack: is_stack,
      ...(() => {
        if (type === EVisualizationType.Bar) {
          return {
            xAxisMin: xAxis?.min,
            xAxisMax: xAxis?.max,
          };
        }
        if (type === EVisualizationType.Column) {
          return {
            yAxisMin: yAxis?.min,
            yAxisMax: yAxis?.max,
          };
        }
        return {};
      })(),
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
              grid_x,
              grid_y,
              grid_x2,
              grid_y2,
              x_axis_name,
              y_axis_name,
              x_axis_label_rotate,
              y_axis_label_rotate,
              colorRange,
              color,
              isColorRange,
              legend,
              legendType,
              legendPosition,
              autoFontSize,
              customFontSize,
              showBarValue,
              isStack,
              yAxisMin,
              yAxisMax,
            } = values;
            resolve({
              grid: {
                left: `${grid_x}px`,
                top: `${grid_y}px`,
                right: `${grid_x2}px`,
                bottom: `${grid_y2}px`,
              },
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
              isColorRange: isColorRange,
              colorRange: colorRange,
              show_bar_value: showBarValue,
              is_stack: isStack,
              auto_size: autoFontSize,
              custom_font_size: customFontSize,
              xAxis: {
                name: x_axis_name,
                axisLabel: {
                  interval: 0,
                  rotate: x_axis_label_rotate,
                },
                ...(type === EVisualizationType.Bar
                  ? {
                      min: yAxisMin,
                      max: yAxisMax,
                    }
                  : {}),
              },
              yAxis: {
                name: y_axis_name,
                ...(type === EVisualizationType.Column
                  ? {
                      min: yAxisMin,
                      max: yAxisMax,
                    }
                  : {}),
                axisLabel: {
                  interval: 0,
                  rotate: y_axis_label_rotate,
                },
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
      <PositionPanel />
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
      <FormItem name="showBarValue" valuePropName="checked" initialValue={true}>
        <Checkbox>显示值</Checkbox>
      </FormItem>
      <FormItem name="isStack" valuePropName="checked" initialValue={false}>
        <Checkbox>堆叠</Checkbox>
      </FormItem>
      <CustomFont />
      <SchemeColor />
      {type === EVisualizationType.Column && (
        <>
          <Divider orientation="left">X轴</Divider>
          <FormItem name="x_axis_name" label="X轴标题">
            <Input />
          </FormItem>
          <FormItem name="x_axis_label_rotate" label="X轴Label旋转">
            <Select defaultValue={0}>
              <Select.Option key={0} value={0}>
                0°
              </Select.Option>
              <Select.Option key={45} value={45}>
                45°
              </Select.Option>
            </Select>
          </FormItem>
        </>
      )}
      {type === EVisualizationType.Bar && (
        <>
          <Divider orientation="left">Y轴</Divider>
          <FormItem name="y_axis_name" label="Y轴标题">
            <Input></Input>
          </FormItem>
          <FormItem name="y_axis_label_rotate" label="Y轴Label旋转">
            <Select defaultValue={0}>
              <Select.Option key={0} value={0}>
                0°
              </Select.Option>
              <Select.Option key={45} value={45}>
                45°
              </Select.Option>
            </Select>
          </FormItem>
        </>
      )}
    </>
  );
}

export default React.forwardRef(BarColumnConfig);
