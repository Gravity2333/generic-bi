interface ICacheValue<T> {
  data:  T;
}

class SharedCache<T = any> {
  public cacheMap: Map<string, ICacheValue<T>>;
  /** 过期时间，默认1分钟 */
  constructor() {
    this.cacheMap = new Map<string, ICacheValue<T>>();
  }

  /** 设置缓存 */
  public set(key: string, value: T) {
    const newVal = {
      data: value,
    };
    if (!this.cacheMap.has(key)) {
      /** 不存在value 直接创建 */
      this.cacheMap.set(key, newVal);
    } else {
      /** 存在value 直接替换，并且更新updateTime */
      this.cacheMap.set(key, newVal);
    }
  }

  /** 获取缓存数据 */
  public get(key: string) {
    /** 找到数据 */
    const result = this.cacheMap.get(key);
    if (!result) return null;
    /** 没过期，直接返回 */
    return result.data;
  }

  /** 删除缓存数据 */
  public del(key: string) {
    return this.cacheMap.delete(key)
  }

  /** reset */
  public reset(){
    return this.cacheMap.clear()
  }
}

export { SharedCache };
