import numeral = require('numeral');
import { AggregateNameDict, ONE_KILO_1000, ONE_KILO_1024 } from '../dict';
import { EFormatterType, IFormMetric } from '../typings';

/**
 * 带宽容量单位换算
 * @param {Number} bps
 * @param {Number} decimal 保留几位小数
 */
export function formatBandwidth(bps: number, decimal = 2) {
  if (bps === 0) return '0bps';
  const sizes = [
    'bps',
    'Kbps',
    'Mbps',
    'Gbps',
    'Tbps',
    'Pbps',
    'Ebps',
    'Zbps',
    'Ybps',
  ];
  const unit = 1000;
  const i = Math.floor(Math.log(bps) / Math.log(unit));
  return `${numeral((bps / Math.pow(unit, i)).toFixed(decimal)).value()}${
    i >= 0 ? sizes[i] : sizes[0]
  }`;
}

/**
 * 容量单位换算
 * @param {Number} bytes 字节数
 * @param {Number} decimal 保留几位小数
 * @param {Number} unit 换算单位 1000 | 1024
 * 
 * @see https://www.zhihu.com/question/20255371/answer/14503510
 *
 * 关于数据单位统一的说明：
  - 存储空间方面，例如xxx 存储空间(总存储空间、离线文件存储空间)，都按照1024进行计算
  - 网络方面，根据查阅数据，标准为1000进制（在计算网络流量时），因而我们产品在所有统计接口流量、传输速率、写入速率等，都统一使用1000进制
  - 主机文件方面，统一按操作系统的1024进制，例如显示单个文件大小，多个文件大小的统计等，都统一使用1024进制，即，一个1MB的文件，其真实大小为1024*1024字节
  - fix: 2022-04-27 存储空间也统一使用 1024 存储，并格式化为 XiB，例如 GiB
   */
export function bytesToSize(bytes: number, decimal = 3, unit = ONE_KILO_1000) {
  if (bytes === 0) return unit === ONE_KILO_1000 ? '0KB' : '0KiB';
  let sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  if (unit === ONE_KILO_1024) {
    sizes = ['B', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
  }
  const i = Math.floor(Math.log(bytes) / Math.log(unit));
  return `${numeral((bytes / Math.pow(unit, i)).toFixed(decimal)).value()}${
    i >= 0 ? sizes[i] : sizes[0]
  }`;
}

/**
 * @see https://api.highcharts.com.cn/highcharts#lang.numericSymbols
 * @see https://zh.wikipedia.org/wiki/%E5%9B%BD%E9%99%85%E5%8D%95%E4%BD%8D%E5%88%B6%E8%AF%8D%E5%A4%B4
 * @param value 格式化的数组
 * @returns number 返回格式化后的字符串
 */
export const formatNumber: (value: number) => string = (value: number) => {
  if (value === 0) return '0';
  const prefixs = ['', 'k', 'M', 'G', 'T', 'P', 'E', 'Z', 'Y'];
  const i = Math.floor(Math.log(value) / Math.log(1000));
  return `${numeral((value / Math.pow(1000, i)).toFixed(2)).value()}${
    i >= 0 ? prefixs[i] : prefixs[0]
  }`;
};

/**
 * 坐标轴的值格式化
 * @param value 值
 * @param type 类型
 * @param ignoreNumber 是否忽略数字的格式化，用于 Tooltip 中展示原始值
 * @returns
 */
export const formatValue = (
  value: number,
  type?: EFormatterType,
  ignoreNumber: boolean = false,
) => {
  if (type === EFormatterType.Percent) {
    return value ? `${(value* 100).toFixed(2)}%` : '0%';
  }
  if (type === EFormatterType.Bps) {
    return value ? formatBandwidth(value) : '0bps';
  }
  if (type === EFormatterType.Bytes) {
    return value ? bytesToSize(value) : '0KB';
  }
  if (type === EFormatterType.Count) {
    if (!ignoreNumber) {
      return value ? formatNumber(value) : '0';
    }
    return value ? numeral(value).format('0,0') : '0';
  }
  if (type === EFormatterType.CountPs) {
    if (!ignoreNumber) {
      return `${value ? formatNumber(value) : '0'}/s`;
    }
    return `${value ? numeral(value).format('0,0') : '0'}/s`;
  }
  if (type === EFormatterType.Ms) {
    return value ? `${value}ms` : '0ms';
  }
  return value;
};

export const formatMetric = (metric: IFormMetric) => {
  if (metric.expression_type === 'sql') {
    return metric.sql_expression;
  } else {
    return `${
      metric.aggregate ? AggregateNameDict[metric.aggregate] : metric.aggregate
    }(${metric.comment || metric.field})`;
  }
};
