import { v4 as uuidv4 } from 'uuid';

export function simpleHash(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash + char) * 233 + 131313; // 使用一个随机的大质数
  }
  return hash;
}

export function uniqueObjToKeyCreator() {
  const map = new Map();
  return function generateKeyByObj(obj: Record<string, any>) {
    const str = JSON.stringify(obj);
    if (map.has(str)) {
      return map.get(str);
    } else {
      const id = uuidv4();
      map.set(str, id);
      return id;
    }
  };
}
