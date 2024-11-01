import { FunctionOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Card, Form, Switch } from 'antd';
import { useContext, useRef, useState } from 'react';

import FormModal from './components/FormModal';
import { IClickhouseColumn, IFilter, IFilterGroup, INpmdDict, OPERATOR_LIST } from '@bi/common';
import React from 'react';
import FormListTag from '../FormListTag';
import { ICustomFilter } from '../../typings';
import { GlobalContext, IGlobalContext } from '@/layouts/GlobalLayout';
import { ConfigPanelContext } from '../..';
import { upperCase } from 'lodash';

/** 递归生成过滤条件名称 */
const getFilterLabel = (
  filterItem: IFilter | IFilterGroup,
  label: string,
  dicts: INpmdDict[],
  columns: IClickhouseColumn[],
) => {
  if ((filterItem as any).group === undefined) {
    const { field, operator, value, dict_field } = filterItem as any;
    /** 单独过滤条件的情况 */
    const dict = dicts.find((dict) => dict.id === dict_field)?.dict;
    const values = (value?.split(',') || [])
      .map((value: string) => (dict && dict[value] ? dict[value] : value))
      .join(',');
    const { comment } = columns?.find((column) => column.name === field) || {};
    const { label: operatorLabel } =
      (OPERATOR_LIST.find((item) => item.value === operator) as any) || {};
    label += ` ${comment || field} ${operatorLabel} ${values}`;
    return label;
  } else {
    /** group的情况 */
    const { group, operator } = filterItem as IFilterGroup;
    if (group.length === 0) {
      return label;
    }
    group.forEach((item: IFilter | IFilterGroup) => {
      if (label === '') {
        label += `( ${getFilterLabel(item, '', dicts, columns)} )`;
      } else {
        label += ` ${operator} ( ${getFilterLabel(item, '', dicts, columns)} )`;
      }
    });
    return label;
  }
};

/** 过滤表单 */
function FilterForm({ disabled = false, form }: { disabled?: boolean; form: any }) {
  const [modalVisiable, setModalVisiable] = useState<boolean>(false);
  const modalFormRef = useRef<any>();
  const { columns } = useContext(ConfigPanelContext);
  const { dicts = [] } = useContext<IGlobalContext>(GlobalContext);
  return (
    <>
      <Card
        size="small"
        title={'过滤条件'}
        bodyStyle={{ padding: '2px' }}
        extra={
          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) =>
              prevValues.filterOperator !== currentValues.filterOperator
            }
          >
            {({ getFieldValue, setFieldValue }) => {
              return (
                <Form.Item noStyle name="filterOperator" initialValue={'AND'}>
                  <Switch
                    checkedChildren="AND"
                    unCheckedChildren="OR"
                    checked={getFieldValue('filterOperator') === 'AND'}
                    onChange={(e) => {
                      setFieldValue('filterOperator', e ? 'AND' : 'OR');
                    }}
                  ></Switch>
                </Form.Item>
              );
            }}
          </Form.Item>
        }
      >
        <Form.Item
          noStyle
          shouldUpdate={(prevValues, curValues) => prevValues.filters !== curValues.filters}
        >
          {({ getFieldValue, setFieldValue }) => {
            const filters = getFieldValue('filters') || [];
            return (
              <>
                <Form.Item name="filters" noStyle initialValue={[]}>
                  {filters.map((filter: any) => {
                    return (
                      <FormListTag
                        id={`${filter?.id}`}
                        closable
                        icon={<FunctionOutlined />}
                        onDelete={() => {
                          const filterList: any[] = getFieldValue('filters');
                          setFieldValue(
                            'filters',
                            filterList.filter((f) => f?.id !== filter?.id),
                          );
                        }}
                        clickable={!disabled}
                        onClick={() => {
                          const type =
                            filter?.expression_type ||
                            (filter?.group[0] ? filter?.group[0]?.expression_type : 'simple');
                          if (type === 'sql') {
                            modalFormRef.current?.setInitValues(filter);
                          } else if (type === 'simple') {
                            modalFormRef.current?.setInitValues({
                              expression_type: type,
                              group_operation: filter?.operator,
                              filters: filter?.group,
                              id: filter?.id,
                            });
                          }
                          setModalVisiable(true);
                        }}
                      >
                        {(() => {
                          const filterList: any[] = getFieldValue('filters');
                          const filterItem = filterList.find((item: any) => item.id === filter?.id);
                          if ((filterItem as IFilterGroup)?.group !== undefined) {
                            let label = '';
                            label = getFilterLabel(filterItem!, label, dicts, columns);
                            return (
                              <div>{label.length > 45 ? `${label.slice(0, 45)}...` : label}</div>
                            );
                          } else {
                            const { sql_expression, filter_type } =
                              (filterItem as ICustomFilter) || {};
                            return (
                              <div>
                                {upperCase(filter_type)} {sql_expression}
                              </div>
                            );
                          }
                        })()}
                      </FormListTag>
                    );
                  })}
                </Form.Item>
              </>
            );
          }}
        </Form.Item>
        <Form.Item style={{ margin: '0px' }}>
          <Button
            type="dashed"
            onClick={() => {
              modalFormRef.current.reset();
              setModalVisiable(true);
            }}
            disabled={disabled}
            style={{ width: '100%' }}
            icon={<PlusOutlined />}
          >
            新增过滤条件
          </Button>
        </Form.Item>
      </Card>
      <FormModal
        ref={modalFormRef}
        open={modalVisiable}
        setOpen={setModalVisiable}
        label={'过滤条件'}
        dicts={dicts}
        columns={columns}
        onFinish={(values) => {
          form.setFieldValue('filters', [...(form.getFieldValue('filters') || []), values]);
        }}
        onUpdate={(id, values) => {
          const list = [...(form.getFieldValue('filters') || [])];
          const index = list.findIndex((i) => i?.id === id);
          if (index >= 0) {
            list.splice(index, 1, values);
          }
          form.setFieldValue('filters', list);
          setModalVisiable(false);
        }}
      />
    </>
  );
}

export default React.forwardRef(FilterForm);
