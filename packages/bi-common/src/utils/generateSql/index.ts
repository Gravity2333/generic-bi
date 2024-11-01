import {
  EVisualizationType,
  INetworkInfoType,
  IWidgetSpecification,
} from '../../typings';
import { generateTimeHistgram } from './widgets/timeseries';
import { generateTable } from './widgets/table';
import { generateBigNumber } from './widgets/bigNumber';
import { generatePie } from './widgets/pie';
import { generateBar } from './widgets/bar';
import { generateTimeColumn } from './widgets/timeColumn';

/**
 *
 * @param widgetSpecification Widget 配置参数
 * @param pretty 是否以回车分隔换行 SQL 语句
 * @returns sql 语句
 * @returns colNames 列名字
 *
 * @see: https://clickhouse.com/docs/en/sql-reference/statements/select/
 */
export function generateSql(
  widgetSpecification: IWidgetSpecification,
  pretty = true,
  networkInfo: INetworkInfoType,
): { sql: string; colNames: string[]; colIdList: string[] } {
  const { viz_type } = widgetSpecification;
  if (viz_type === EVisualizationType.BigNumberTotal) {
    return generateBigNumber(widgetSpecification, networkInfo);
  } else if (viz_type === EVisualizationType.Pie) {
    return generatePie(widgetSpecification, networkInfo);
  } else if (
    viz_type === EVisualizationType.Bar ||
    viz_type === EVisualizationType.Column
  ) {
    return generateBar(widgetSpecification, networkInfo);
  } else if (viz_type === EVisualizationType.Table) {
    return generateTable(widgetSpecification, networkInfo);
  } else if (viz_type === EVisualizationType.TimeHistogram) {
    return generateTimeHistgram(widgetSpecification, networkInfo);
  } else if (viz_type === EVisualizationType.Time_Column) {
    return generateTimeColumn(widgetSpecification, networkInfo);
  } else {
    return {
      sql: '',
      colNames: [],
      colIdList: [],
    };
  }
}
