import * as SqlString from 'sqlstring';
import { isCidr } from '.';
import { IPv4Regex } from '../dict';
import {
  EFilterGroupOperatorTypes,
  IFilter,
  IFilterCondition,
  IFilterGroup,
  TCHFieldType,
  TFieldOperator,
} from '../typings';

// 比较操作符
const comparisonOperatorList: TFieldOperator[] = [
  'EQUALS',
  'NOT_EQUALS',
  'GREATER_THAN',
  'GREATER_THAN_OR_EQUAL',
  'LESS_THAN',
  'LESS_THAN_OR_EQUAL',
];

/**
 * 根据字段类型获取对应支持的操作符
 * @param fieldType 字段类型
 * @returns 该类型支持的操作符数组
 */
export function getOperatorByFieldType(
  fieldType: TCHFieldType,
): TFieldOperator[] {
  const type = fieldType.toLocaleLowerCase();

  // 单纯的 String，不包含 Atrray(String)
  if (type.includes('string') && !type.includes('array')) {
    return ['EQUALS', 'NOT_EQUALS', 'LIKE', 'EXISTS', 'NOT_EXISTS', 'MATCH'];
  }

  // Array(IP4) or Array(IP6)
  if (type.includes('array') && type.includes('ipv')) {
    return ['EQUALS', 'EXISTS', 'NOT_EXISTS'];
  }

  // Array(T)
  if (type.includes('array') && !type.includes('ipv')) {
    return ['EQUALS', 'LIKE', 'EXISTS', 'NOT_EXISTS'];
  }

  // 单纯的 IP 类型
  // IPv4 or IPv6
  if (!type.includes('array') && type.includes('ipv')) {
    return ['EQUALS', 'NOT_EQUALS'];
  }

  if (
    // 时间
    type.includes('datetime') ||
    // 无符号数字
    type.includes('uint')
  ) {
    return comparisonOperatorList;
  }

  // 其他的类型的只返回等于号
  return ['EQUALS'];
}

/**
 * 将单个过滤字段转换为 sql 语句
 * @param filter 单个过滤字段
 */
function filter2Sql(filter: IFilter): string {
  // 自定义 sql 语句
  if (filter.expression_type === 'sql') {
    return filter.sql_expression || '';
  }

  const { field, field_type, operator, value } = filter;

  // 判断操作符是否是当前字段类型所支持的
  const supportOps = getOperatorByFieldType(field_type);
  if (!supportOps.includes(operator)) {
    throw Error(`字段 [${field}<${field_type}>] 不支持 [${operator}]`);
  }

  // 字段类型先转成小写，防止大小写不一致导致的异常判断
  const fieldType = field_type.toLocaleLowerCase();
  // 判断字段类型是不是数组类型
  const isArray = fieldType.includes('array');

  var opText = '';
  // @see: https://clickhouse.tech/docs/zh/sql-reference/operators/
  if (operator === 'EQUALS') {
    opText = '=';
  }
  if (operator === 'NOT_EQUALS') {
    opText = '!=';
  }
  if (operator === 'GREATER_THAN') {
    opText = '>';
  }
  if (operator === 'GREATER_THAN_OR_EQUAL') {
    opText = '>=';
  }
  if (operator === 'LESS_THAN') {
    opText = '<';
  }
  if (operator === 'LESS_THAN_OR_EQUAL') {
    opText = '<=';
  }

  let valueExpr = value;
  // 替换符号
  if (typeof valueExpr === 'string') {
    valueExpr = SqlString.escape(valueExpr);
  }

  // 如果值可以切分成多个，就转成数组进行 in 操作
  const splitValueList =
    typeof value === 'string' ? value.split(',').filter((item) => item) : [];

  // 是否是基本的比较操作符
  if (comparisonOperatorList.includes(operator)) {
    // ===============
    // String 类型的数组
    // Array(LowCardinality(String)) or Array(String)
    if (isArray && fieldType.includes('string')) {
      if (splitValueList.length > 0) {
        return `hasAll(${SqlString.escapeId(field)}, [${SqlString.escape(
          splitValueList,
        )}])=1`;
      } else {
        return `has(${SqlString.escapeId(field)}, ${SqlString.escape(
          value,
        )})=1`;
      }
    }

    // ===============
    // IPv4类型
    if (fieldType.includes('ipv4')) {
      if (!isCidr(value, 'IPv4')) {
        if (!IPv4Regex.test(value)) {
          throw Error(
            `字段 [${operator}<${field_type}>] 过滤内容不是正确的 IPv4: ${value}`,
          );
        }
      }

      const isCidrIpv4 = isCidr(value as string, 'IPv4');

      // 单纯的 IPv4类型
      if (!isArray && !isCidrIpv4) {
        valueExpr = `toIPv4(${SqlString.escape(value)})`;
      }

      // 如果是 IPv4_CIDR
      if (!isArray && isCidrIpv4) {
        const [ipAddress, mask] = value.split('/');
        const notEqual = opText === '!=' ? 'NOT' : '';
        return `${SqlString.escapeId(
          field,
        )} ${notEqual} between IPv4CIDRToRange(toIPv4(${SqlString.escape(
          ipAddress,
        )}), ${mask}).1 and IPv4CIDRToRange(toIPv4(${SqlString.escape(
          ipAddress,
        )}), ${mask}).2`;
      }

      // 如果是 Array(IPv4)
      if (isArray && !isCidrIpv4) {
        return `has(${SqlString.escapeId(field)}, toIPv4(${SqlString.escape(
          value,
        )}))=1`;
      }

      // 如果是 Array(IPv4_CIDR)
      if (isArray && isCidrIpv4) {
        return `notEmpty(arrayFilter(y -> (toIPv4(${SqlString.escape(
          value,
        )}) BETWEEN y.1 AND y.2), arrayMap(x -> (IPv4CIDRToRange(toIPv4(splitByChar('/', x)[1]), toUInt8(splitByChar('/', x)[2]))), ${SqlString.escapeId(
          field,
        )})))`;
      }
    }

    // ===============
    // IPv6类型
    if (fieldType.includes('ipv6')) {
      if (!IPv4Regex.test(value)) {
        throw Error(
          `字段 [${operator}<${field_type}>] 过滤内容不是正确的 IPv6: ${value}`,
        );
      }

      const isCidrIpv6 = isCidr(value as string, 'IPv6');

      // 单纯的 IPv6 类型
      if (!isArray && !isCidrIpv6) {
        valueExpr = `toIPv6(${SqlString.escape(value)})`;
      }

      // 如果是 IPv6_CIDR
      if (!isArray && isCidrIpv6) {
        const [ipAddress, mask] = value.split('/');
        const notEqual = opText === '!=' ? 'NOT' : '';
        return `${SqlString.escapeId(
          field,
        )} ${notEqual} between IPv6CIDRToRange(toIPv6(${SqlString.escape(
          ipAddress,
        )}), ${SqlString.escape(
          mask,
        )}).1 and IPv6CIDRToRange(toIPv6(${SqlString.escape(
          ipAddress,
        )}), ${SqlString.escape(mask)}).2`;
      }

      // 如果是 Array(IPv6)
      if (isArray && !isCidrIpv6) {
        return `has(${SqlString.escapeId(field)}, toIPv6(${SqlString.escape(
          value,
        )}))=1`;
      }

      // 如果是 Array(IPv6_CIDR)
      if (isArray && isCidrIpv6) {
        return `notEmpty(arrayFilter(y -> (toIPv6(${SqlString.escape(
          value,
        )}) BETWEEN y.1 AND y.2), arrayMap(x -> (IPv6CIDRToRange(toIPv6(splitByChar('/', x)[1]), toUInt8(splitByChar('/', x)[2]))), ${SqlString.escapeId(
          field,
        )})))`;
      }
    }

    // 剩余的其他类型
    if (opText === '!=') {
      return `((${SqlString.escapeId(
        field,
      )} ${opText} ${valueExpr}) or (isNull(${SqlString.escapeId(field)})))`;
    }
    return `${SqlString.escapeId(field)} ${opText} ${valueExpr}`;
  }

  // Like
  if (operator === 'LIKE') {
    // 如果是 Array
    if (isArray) {
      return ` notEmpty(arrayFilter(x -> x LIKE ${SqlString.escape(
        value,
      )}, ${SqlString.escapeId(field)}))`;
    }

    return `${SqlString.escapeId(field)} LIKE ${SqlString.escape(
      `%${value}%`,
    )}`;
  }

  // Not Like
  if (operator === 'NOT_LIKE') {
    // 如果是 Array
    if (isArray) {
      return `notEmpty(arrayFilter(x -> x NOT LIKE ${SqlString.escape(
        value,
      )}, ${SqlString.escapeId(field)}))`;
    }

    return `${SqlString.escapeId(field)} NOT LIKE ${SqlString.escape(
      `%${value}%`,
    )}`;
  }

  // Exists
  if (operator === 'EXISTS') {
    return `notEmpty(${SqlString.escapeId(field)})`;
  }
  // Not Exists
  if (operator === 'NOT_EXISTS') {
    return `empty(${SqlString.escapeId(field)})`;
  }
  // Match
  if (operator === 'MATCH') {
    return `match(${SqlString.escapeId(field)}, ${SqlString.escape(value)})`;
  }
  return '';
}

/**
 * 将过滤组合转换为 sql 语句
 * @param condition 过滤条件
 */
function filterGroup2Sql(
  { operator, group }: IFilterGroup,
): string {
  const operatorUpperCase = (
    operator || EFilterGroupOperatorTypes.AND
  ).toLocaleUpperCase();
  const operatorAnd = EFilterGroupOperatorTypes.AND.toLocaleUpperCase();

  let groupExpr = '';
  const appendBrackets = group?.length > 1 && operatorUpperCase === operatorAnd;

  if (group?.length === 0) {
    return '';
  }

  // and 添加括号
  if (appendBrackets) {
    groupExpr += '(';
  }

  group?.forEach((row, index) => {
    if (row.hasOwnProperty('group')) {
      groupExpr += ` ( ${filterGroup2Sql(row as IFilterGroup)} ) `;
    } else {
      groupExpr += ` ${filter2Sql(row as IFilter)} `;
    }

    // 拼接逻辑关系
    if (index !== group?.length - 1) {
      groupExpr += ` ${operator} `;
    }
  });

  // and 添加括号
  if (appendBrackets) {
    groupExpr += ')';
  }

  return groupExpr;
}

/**
 * 将完整的过滤条件转换为 sql 语句
 * @param condition 过滤条件
 */
export function filterCondition2Sql(
  condition: IFilterCondition,
  filterOperator = 'AND',
): string {
  let whereExpr = '';
  condition.forEach((row, index) => {
    // 如果是组合
    if (row.hasOwnProperty('group')) {
      const r = filterGroup2Sql(row as IFilterGroup);
      if (r) {
        whereExpr += `(${r})`;
      }
    } else {
      // 单个的字段条件
      const r = filter2Sql(row as IFilter);
      if (r) {
        whereExpr += `(${r})`;
      }
    }
    if (index !== condition.length - 1) {
      whereExpr += ` ${filterOperator} `;
    }
  });
  return whereExpr;
}
