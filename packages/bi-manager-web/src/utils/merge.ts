function isComplexType(obj: any) {
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
          /** 当前列表 */
          if (!Array.isArray((result as any)[key])) {
            /** 类型不同，直接替换 */
            (result as any)[key] = obj[key];
            continue;
          }
          const currentArr = (result as any)[key] || [];
          /** 长度不相同时，直接覆盖 */
          if (needMergeArr.length !== currentArr.length) {
            (result as any)[key] = needMergeArr;
            continue;
          }
          /** 长度相同时，合并内容 */
          const arrLen = currentArr.length;
          const mergedArr: any[] = [];
          for (let i = 0; i < arrLen; i++) {
            const needMergeItem = needMergeArr[i];
            const currentItem = currentArr[i];
            mergedArr[i] = deepMerge(currentItem || {}, needMergeItem || {});
          }
          (result as any)[key] = mergedArr;
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
