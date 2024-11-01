import { IPv4Regex, IPv6Regex } from '../dict';

/** 判断值是否为空字符串 */
export const isEmpty = (val: any) => val === '';

/** 判断值是否存在 */
export const isExisty = (val: any) => {
  return val !== undefined && val !== null;
};

/**
 * 判断对象是否为空
 */
export function objectIsEmpty(obj: Record<string, any>) {
  if (!obj) return true;
  if (Object.keys(obj).length === 0) return true;

  return false;
}

/**
 * 判断是否是 CIDR 格式的 IP 地址
 */
export function isCidr(ip: string, type: 'IPv4' | 'IPv6') {
  if (!ip || ip.indexOf('/') === -1) {
    return false;
  }
  const ipAndCidr = ip.split('/');
  if (ipAndCidr.length !== 2) {
    return false;
  }
  const [ipAddress, mask] = ipAndCidr;
  if (!ipAddress || isNaN(+mask)) {
    return false;
  }
  const maskNum = +mask;
  if (type === 'IPv4') {
    // 检查IP和掩码
    if (IPv4Regex.test(ipAddress) && maskNum > 0 && maskNum <= 32) {
      return true;
    }
    return false;
  } else if (type === 'IPv6') {
    // 检查IP和掩码
    if (IPv6Regex.test(ipAddress) && maskNum > 0 && maskNum <= 128) {
      return true;
    }
    return false;
  }

  return false;
}
