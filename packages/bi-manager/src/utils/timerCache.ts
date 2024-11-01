interface ITimeCacheValue<T> {
  updateTime: number;
  data: Promise<T>|T;
}

class TimerCache<T = any> {
  /** 过期时间，超过这个时间会删除对应的cache */
  private timeout = 60000;
  private cacheMap: Map<string, ITimeCacheValue<T>>;
  /** 过期时间，默认1分钟 */
  constructor(timeout = 60000) {
    this.timeout = timeout;
    this.cacheMap = new Map<string, ITimeCacheValue<T>>();
  }

  /** 判断是否过期 */
  private isExpired(updateTime: number) {
    return +new Date() - updateTime > this.timeout;
  }

  /** 设置缓存 */
  public set(key: string, value: T) {
    const newVal = {
      updateTime: +new Date(),
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
    /** 检查是否过期 */
    if (this.isExpired(result.updateTime)) {
      // 删除当前数据，并且返回空
      this.cacheMap.delete(key);
      return null;
    }
    /** 没过期，直接返回 */
    return result.data;
  }

  /** 异步设置缓存 */
  public async setAsync(key: string, fetcher: () => Promise<T>) {
    const result = this.cacheMap.get(key);
    if (!result) {
      /** 不存在value 直接创建 */
      this.cacheMap.set(key, {
        updateTime: +new Date(),
        data: fetcher(),
      });
    } else {
      /** 存在value 查看是否过期*/
      if (this.isExpired(result.updateTime)) {
        /** 过期，更新数据 */
        this.cacheMap.set(key, {
          updateTime: +new Date(),
          data: fetcher(),
        });
      }
    }
    /** 没过期，什么都不处理 */
    return true;
  }

  /** 如果不存在，则查询 */
  public async fetchIfNoExist(key: string, fetcher: () => Promise<T>) {
    /** 找到数据 */
    const result = this.cacheMap.get(key);

    if (!result) {
      /** 不存在数据，查询 */
      const fetchdDataPromise = fetcher();
      this.cacheMap.set(key, {
        updateTime: +new Date(),
        data: fetchdDataPromise,
      });
      return await fetchdDataPromise;
    }

    /** 检查是否过期 */
    if (this.isExpired(result.updateTime)) {
      // 数据过期 更新并且返回
      const fetchdDataPromise = fetcher();
      this.cacheMap.set(key, {
        updateTime: +new Date(),
        data: fetchdDataPromise,
      });
      return fetchdDataPromise;
    }
    /** 没过期，直接返回 */
    return (result.data as Promise<T>);
  }
}

export { TimerCache };
