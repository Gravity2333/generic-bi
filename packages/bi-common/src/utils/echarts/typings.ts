import type {
  BrushComponentOption,
  DatasetComponentOption,
  DataZoomComponentOption,
  GridComponentOption,
  LegendComponentOption,
  MarkAreaComponentOption,
  MarkLineComponentOption,
  MarkPointComponentOption,
  SingleAxisComponentOption,
  TimelineComponentOption,
  TitleComponentOption,
  ToolboxComponentOption,
  TooltipComponentOption,
} from 'echarts/components';
import type {
  BarSeriesOption,
  LineSeriesOption,
  LinesSeriesOption,
  PieSeriesOption,
} from 'echarts/charts';
import * as echarts from 'echarts/core';

export type ECOption = echarts.ComposeOption<
  | BarSeriesOption
  | LineSeriesOption
  | TitleComponentOption
  | GridComponentOption
  | LinesSeriesOption
  | PieSeriesOption
  | BrushComponentOption
  | DataZoomComponentOption
  | LegendComponentOption
  | MarkAreaComponentOption
  | MarkLineComponentOption
  | MarkPointComponentOption
  | SingleAxisComponentOption
  | TimelineComponentOption
  | ToolboxComponentOption
  | TooltipComponentOption
  | DatasetComponentOption
>;

export interface ITableProps {
  height?: string;
  width?: string;
  style: any;
  dataSource: any[];
  tableColumns?: any[];
  columns: {
    title: string;
    dataIndex: string;
    key: string;
    render: (value: string) => any;
  }[];
}
