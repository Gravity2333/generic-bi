export function isComplexType(obj: any) {
  return (typeof obj === 'object' && obj !== null) || typeof obj === 'function';
}

function isFunction(obj: any) {
  return typeof obj === 'function';
}

function isArray(obj: any) {
  return Array.isArray(obj);
}

export function deepMerge(...objects: Record<string, any>[]) {
  /** 处理简单类型 */
  if (objects[0] && (!isComplexType(objects[0]) || isFunction(objects[0]) || isArray(objects[0]))) {
    /** 以第一个参数为准，如果是简单类型，直接return */
    return objects[objects.length - 1];
  }

  const result = {};
  for (const obj of objects || []) {
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        /** 处理array的情况 */
        if (typeof obj[key] === 'object' && Array.isArray(obj[key])) {
          /** 待合并的列表 */
          const needMergeArr = obj[key] || [];
          (result as any)[key] = needMergeArr;
          continue;
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
          // 如果值是对象，则递归合并
          (result as any)[key] = deepMerge((result as any)[key] || {}, obj[key]);
        } else {
          // 如果值不是对象，直接赋值

          (result as any)[key] = obj[key];
        }
      }
    }
  }
  return result;
}

function _isObj(obj: any) {
  return typeof obj === 'object' && obj !== null;
}

export function deepEqual(obj1: any, obj2: any) {
  // 1.判断一个或者两个都不是对象
  if (!_isObj(obj1) || !_isObj(obj2)) {
    return obj1 === obj2;
  }

  // 2.同一个对象
  if (obj1 === obj2) {
    return true;
  }

  // 3.不是同一个对象
  // Object.keys(obj) 一个表示给定对象的所有可枚举属性的字符串数组
  // 先判断键的数量
  // 3.1不一样
  if (Object.keys(obj1).length !== Object.keys(obj2).length) return false;
  // 3.2一样
  for (let key in obj1) {
    const res = deepEqual(obj1[key], obj2[key]);
    if (!res) return false;
  }

  return true;
}
