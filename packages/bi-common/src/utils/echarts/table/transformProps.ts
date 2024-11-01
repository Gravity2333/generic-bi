import { extractAliasFromSQL, ITransformEChartOptionsParams } from '..';
import { formatValue, getTimeRange, parseObjJson } from '../..';
import {
  EFormatterType,
  ESelectType,
  IWidgetSpecification,
  TableColumnType,
} from '../../../typings';
import { v4 as uuidv4 } from 'uuid';
import moment from 'moment';

export default function transformProps(params: ITransformEChartOptionsParams) {
  const {
    height = '100%',
    width = '100%',
    queriesData,
    widget,
    colNames = [],
    colIdList = [],
  } = params;
  const {
    metrics,
    groupby,
    table_columns = [],
    time_range,
  } = parseObjJson<IWidgetSpecification>(widget.specification);

  const colNameMap = [...metrics, ...groupby].reduce((prev, curr: any) => {
    const index = curr.id || curr.field;
    return {
      ...prev,
      [index]: curr,
    };
  }, {});

  const size = {
    height,
    width,
  };

  let columns: TableColumnType[] = [
    ...metrics.map((metric) => {
      const {
        id,
        aggregate,
        expression_type,
        field,
        sql_expression,
        display_name,
        type,
        isBandwidth,
      } = metric || {};
      let data: TableColumnType;
      if (expression_type === ESelectType.SIMPLE) {
        data = {
          name: `${aggregate}(${field})`,
          id: id!,
          type: 'metric',
          displayName: display_name,
          fieldType: type,
          isBandwidth,
        };
      } else {
        data = {
          name: sql_expression!,
          id: id!,
          type: 'metric',
          displayName: display_name,
          fieldType: type,
          isBandwidth,
        };
      }
      return data;
    }),
    ...groupby.map((group) => {
      const { field, display_name } = group || {};
      const data = {
        name: field,
        id: field,
        type: 'group',
        displayName: display_name,
      } as TableColumnType;
      return data;
    }),
  ];

  const mergedColumn = [] as any[];
  for (let i = 0; i < colNames?.length; i++) {
    const colId = colIdList[i];
    const colObj = columns?.find((c) => c?.id === colId);
    const colName = colNameMap[colId].display_name;
    const dataIndex = colNames[i];

    let columnFormat = '';
    let groupFieldType = '';
    if (colObj?.type === 'group') {
      const groupByData = groupby?.find((g) => g?.field === colId);
      groupFieldType = groupByData?.type || '';
      columnFormat = groupByData?.column_format || '';
    } else if (colObj?.type === 'metric') {
      columnFormat = metrics?.find((m) => m?.id === colId)?.column_format || '';
    }
    mergedColumn.push({
      headerName: colName || colObj?.name,
      key: uuidv4(),
      ellipsis: true,
      field: dataIndex,
      type: groupFieldType,
      fieldType: colObj?.fieldType,
      sorter: (a, b) => a[dataIndex] - b[dataIndex],
      cellRenderer: ({ value }) => {
        if (columnFormat === EFormatterType.Raw || !columnFormat) {
          if (typeof value === 'object' && value instanceof Array) {
            return value?.join(', ') || '';
          }else{
            return value
          }
        }
        if (colObj?.isBandwidth && time_range) {
          const [startTime, endTime] = getTimeRange(time_range);
          const timeDiff = moment(endTime).diff(startTime) / 1000 || 1;
          return formatValue(
            parseFloat(value) / timeDiff,
            columnFormat as EFormatterType,
          );
        } else {
          return (
            formatValue(parseFloat(value), columnFormat as EFormatterType) || ''
          );
        }
      },
    });
  }

  return {
    height,
    width,
    style: { width: size?.width },
    dataSource: queriesData.map((data) => {
      const d = mergedColumn.reduce((prev, cur) => {
        if (cur?.fieldType?.includes('DateTime64')) {
          return {
            ...prev,
            [cur?.field]: moment(data[cur?.field])
              .add(8, 'h')
              .format('YYYY-MM-DD HH:mm:ss'),
          };
        }

        const alias = extractAliasFromSQL(cur?.field)[0];

        return {
          ...prev,
          [cur?.field]: data[alias || cur?.field],
        };
      }, {});
      return {
        ...d,
        key: data.key || uuidv4(),
      };
    }),
    tableColumns: table_columns,
    columns: mergedColumn,
  };
}
