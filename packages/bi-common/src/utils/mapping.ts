import { addArrayJoin, getMetricFullName, parseObjJson } from '.';
import { INpmdDict, IWidgetFormData, IWidgetSpecification } from '../typings';

// 定义一个深拷贝函数  接收目标target参数
export function deepClone(target: any) {
  // 定义一个变量
  let result: any;
  // 如果当前需要深拷贝的是一个对象的话
  if (typeof target === 'object') {
    // 如果是一个数组的话
    if (Array.isArray(target)) {
      result = []; // 将result赋值为一个数组，并且执行遍历
      for (let i in target) {
        // 递归克隆数组中的每一项
        result.push(deepClone(target[i]));
      }
      // 判断如果当前的值是null的话；直接赋值为null
    } else if (target === null) {
      result = null;
      // 判断如果当前的值是一个RegExp对象的话，直接赋值
    } else if (target.constructor === RegExp) {
      result = target;
    } else {
      // 否则是普通对象，直接for in循环，递归赋值对象的所有值
      result = {};
      for (let i in target) {
        result[i] = deepClone(target[i]);
      }
    }
    // 如果不是对象的话，就是基本数据类型，那么直接赋值
  } else {
    result = target;
  }
  // 返回最终结果
  return result;
}

/** 用来匹配字典 */
export function mappingDict(
  widget: IWidgetFormData,
  data: any,
  dicts: INpmdDict[],
) {
  const queriesData = deepClone(data);
  const { metrics, groupby } = parseObjJson<IWidgetSpecification>(
    widget.specification,
  );
  /** 包含字典映射关系的度量 */
  const metricMappingList = metrics.filter(
    (metricItem) => metricItem.dict_field,
  );
  /** 包含字典映射关系的分组 */
  const groupbyMappingList = groupby.filter(
    (groupbyItem) => groupbyItem.dict_field,
  );
  /** 匹配groupby */
  groupbyMappingList.forEach((groupbyItem) => {
    let { dict_field, field, type, arrayJoin } = groupbyItem;
    if (/^Array((.*))$/.test(type || '')) {
      field = addArrayJoin(field, arrayJoin);
    }
    if (dict_field && field) {
      const dict = dicts.find((dict) => dict.id === dict_field)?.dict;
      Object.keys(queriesData).forEach((key) => {
        const dataItem = queriesData[key];
        if (dataItem && dict) {
          dataItem.dataIndex = dataItem[field];
          dataItem[field] = dict[dataItem[field]] || dataItem[field];
        }
      });
    }
  });

  /** 匹配metric */
  metricMappingList.forEach((metricItem) => {
    const { dict_field, is_dict_mapping } = metricItem;
    if (is_dict_mapping) {
      const field = getMetricFullName(metricItem);
      if (dict_field && field) {
        const dict = dicts.find((dict) => dict.id === dict_field)?.dict;
        Object.keys(queriesData).forEach((key) => {
          const dataItem = queriesData[key];
          if (dataItem && dict) {
            dataItem.dataIndex = dataItem[field];
            dataItem[field] = dict[dataItem[field]] || dataItem[field];
          }
        });
      }
    }
  });
  return queriesData;
}
