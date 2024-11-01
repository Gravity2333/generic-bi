import { TTheme } from '@/interface';
import { ECharts } from 'echarts';
import ReactEcharts from 'echarts-for-react';
import { useCallback, useEffect, useState } from 'react';
import { useModel } from 'umi';
import { getThemeColors } from '@bi/common';
import moment from 'moment';
import React from 'react';
import AnyWhereContainer from '../AnyWhereContainer';
import { useClickAway } from 'ahooks';
interface Props {
  option: any;
  brush?: boolean;
  onBrushEnd?: (startTime: number, endTime: number) => void;
  brushMenuChildren?: JSX.Element;
}
export const clearChartBrush = (chart: ECharts) => {
  chart.dispatchAction({
    type: 'brush',
    areas: [],
  });
};

export default function EchartsCore(props: Props) {
  const { option, onBrushEnd, brushMenuChildren, brush = false } = props;
  const { initialState } = useModel('@@initialState');
  const [internalChart, setInternalChart] = useState<ECharts>();
  const chartContainerRef = React.useRef<HTMLDivElement | null>(null);
  const [brushMenuDisplay, setBrushMenuDisplay] = useState(false);
  const [brushMenuPos, setBrushMenuPos] = useState<{ top: number; left: number }>({
    top: -1,
    left: -1,
  });
  const changeTheme = useCallback(
    (nextTheme?: TTheme) => {
      // 根据主题颜色动态加载图表的颜色定义
      const nextColors = getThemeColors(nextTheme);

      const axisStyle = {
        axisLabel: {
          color: nextColors.axisLabelColor,
        },
        splitLine: {
          lineStyle: { color: nextColors.lineColor },
        },
        axisLine: {
          lineStyle: { color: nextColors.lineColor },
        },
      };
      internalChart?.setOption({
        title: {
          textStyle: {
            color: nextColors.titleColor,
          },
        },
        xAxis: axisStyle,
        yAxis: [axisStyle, axisStyle],
        legend: {
          textStyle: {
            color: nextColors.legendTextColor,
          },
          inactiveColor: nextColors.legendInactiveColor,
        },
      });
    },
    [internalChart],
  );

  useEffect(() => {
    if (internalChart && internalChart.dispatchAction && brush) {
      internalChart.dispatchAction({
        type: 'takeGlobalCursor',
        key: 'brush',
        brushOption: {
          brushType: 'lineX',
          brushMode: 'single',
        },
      });
      internalChart.on('brushEnd', (params) => {
        const { areas } = params as any;
        if (areas.length > 0) {
          const { coordRanges, range } = areas[0];

          const rect = chartContainerRef.current?.getBoundingClientRect();
          // range 里是按照大小排序的 [小的 X 坐标，大的 X 坐标]
          // 由于无法区分框选的方向感，所以这里默认使用大的 X 坐标
          const offsetX = range[1];
          // 无法获取 Y 轴位置，所以取图表中间位置
          const offsetY = (rect?.height || 0) / 2;
          const pointInPixel = [offsetX, offsetY];

          // 判断当前指针位置是否在grid区域内，
          // @see https://echarts.apache.org/zh/api.html#echartsInstance.containPixel
          const inGrid = internalChart.containPixel('grid', pointInPixel);
          if (inGrid) {
            let left = offsetX;
            let top = offsetY;
            if (offsetX + 80 > rect!.width) {
              left = offsetX - 100;
            }
            if (offsetY + 200 > rect!.height) {
              top = rect!.height - 200;
            }
            setBrushMenuPos({ left, top });
            setBrushMenuDisplay(true);
          }

          if (coordRanges && coordRanges[0].length === 2) {
            let brushEndFlag = true;
            const [from, end] = coordRanges[0];
            // 判断时间范围
            if (!from || !end) {
              brushEndFlag = false;
            }

            const startTime = moment(from).valueOf();
            const endTime = moment(end).valueOf();
            if (brushEndFlag && onBrushEnd) {
              onBrushEnd(startTime, endTime);
            }
          }
        }
      });
    }
    if (!onBrushEnd) {
      internalChart?.dispatchAction({
        type: 'takeGlobalCursor',
      });
    }
  }, [internalChart, onBrushEnd]);

  useEffect(() => {
    changeTheme(initialState?.theme);
  }, [initialState?.theme, changeTheme]);

  const handleChartReadyCallback = (chart: ECharts) => {
    if (brush) {
      setInternalChart(chart);
      /** 点击图标内部时关闭菜单 */
      chart.getZr().on('click', () => {
        setBrushMenuDisplay(false);
      });
    }
  };

  /** 点击图图表外部时关闭菜单 */
  useClickAway(() => {
    setBrushMenuDisplay(false);
    if (internalChart) {
      clearChartBrush(internalChart);
    }
  }, [chartContainerRef]);

  return (
    <div ref={chartContainerRef} style={{ height: '100%', width: '100%' }}>
      <ReactEcharts
        onChartReady={handleChartReadyCallback}
        option={option}
        style={{ height: '100%', width: '100%' }}
        className="react_for_echarts"
      />
      <AnyWhereContainer
        style={{ padding: 0 }}
        {...brushMenuPos}
        children={brushMenuChildren}
        display={brushMenuDisplay}
      />
    </div>
  );
}
