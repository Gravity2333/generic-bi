import { TooltipOption } from 'echarts/types/dist/shared';
import { ITransformEChartOptionsParams } from '.';

/**
 * 默认主题下的图表颜色搭配
 */
export const lightColors = {
  // 标题颜色
  titleColor: '#333',
  // 分割线的颜色
  lineColor: '#f0f0f0',
  // 图例文字的颜色
  legendTextColor: '#333',
  // 图例关闭时的演示
  legendInactiveColor: '#ccc',
  // 轴标签的颜色
  axisLabelColor: '#666',
};

/**
 * 暗黑主题下的图表颜色搭配
 */
export const darkColors = {
  titleColor: 'rgba(255, 255, 255, 0.8)',
  lineColor: '#545454',
  legendTextColor: 'rgba(255, 255, 255, 0.8)',
  legendInactiveColor: '#666',
  axisLabelColor: 'rgba(255, 255, 255, 0.8)',
};

/**
 * 获取当前颜色配色
 * @param theme 主题
 * @returns
 */
export const getThemeColors = (
  theme: ITransformEChartOptionsParams['theme'] = 'light',
) => {
  return theme === 'light' ? lightColors : darkColors;
};

export const tooltipConfig = {
  // 紧跟着鼠标移动
  transitionDuration: 0,
  // 隐藏延时
  hideDelay: 0,
  trigger: 'axis',
  confine: true, // 不限制图表在区域内
  backgroundColor: '#fff',
  axisPointer: {
    // 交叉线
    // type: 'cross',
    // 阴影
    // type: 'shadow',
    // 十字准星线的颜色
    lineStyle: {
      color: '#cccccc',
      type: 'dashed',
    },
    crossStyle: {
      color: '#e8e8e8',
    },
    shadowStyle: {
      color: 'rgba(150,150,150,0.1)',
    },
  },
  textStyle: {
    fontSize: 12,
    fontFamily:
      '"Lucida Grande", "Lucida Sans Unicode", Arial, Helvetica, sans-serif;',
    color: 'rgb(51, 51, 51)',
  },
  padding: 12,
  extraCssText:
    'box-shadow: 0px 2px 8px 0px #cacaca;border-radius: 4px;opacity: 0.9;',
} as TooltipOption;
