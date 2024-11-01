type SyncFetch = (input: RequestInfo | URL, init?: RequestInit) => any;
type SyncFetchResult = {
  status: 'fulfilled' | 'rejected' | 'pending';
  value?: any;
  error?: any;
};

/** 同步请求函数 */
export function runSyncRequest(syncFunc: (_fetch: SyncFetch) => void) {
  /** 存储异步函数返回结果 */
  const fetchResults: SyncFetchResult[] = [];
  /** 当前运行到的函数index */
  let currentRunningFetchIndex = 0;
  /** 实现_fetch函数，fetch为同步函数 */
  const _fetch: SyncFetch = (...args) => {
    /** 本函数会多次运行，如果前面的_fetch函数已经有结果，则直接使用缓存，没有再去调用winodw.fetch请求 */
    const fetchResult = fetchResults[currentRunningFetchIndex];
    if (fetchResult) {
      /** 已经有缓存了 直接返回 */
      currentRunningFetchIndex++;
      if (fetchResult.status === 'fulfilled') {
        return fetchResult.value;
      } else if (fetchResult.status === 'rejected') {
        throw new Error(fetchResult.error);
      }
    } else {
      /** 没有缓存，发请求 */
      /** 为了实现同步运行，这里在发出请求后，需要暂停函数运行，等待返回结果
       *  如何实现停止 并且 等待？
       *  使用抛异常的方式暂停函数运行，抛出当前请求的Promise对象，并且在catch中，设置改Promise对象的then方法
       *  在then方法中，把请求回来的结果/失败原因 设置到缓存列表中，并且重新调用传入的syncFunc, 从头开始执行函数
       *  遇到已经返回的_fetch 直接返回值，遇到没返回的 重复上面过程，指导函数运行结束
       */

      const fetchResult = {} as SyncFetchResult;
      fetchResults[currentRunningFetchIndex++] = fetchResult;
      throw window
        .fetch(...args)
        .then((res) => res.json())
        .then(
          (value) => {
            /** 处理成功 */
            fetchResult.status = 'fulfilled';
            fetchResult.value = value;
          },
          (reason) => {
            /** 处理失败 */
            fetchResult.status = 'rejected';
            fetchResult.error = reason;
          },
        );
    }
  };

  /** 注意，try catch 一定要拿到_fetch外面，因为你要通过throw终止syncFunc的运行，而不仅仅是_fetch的运行 */
  const runSync = () => {
    try {
      /** 运行传入的同步函数 */
      syncFunc(_fetch);
    } catch (pendingPromise) {
      /** 检查，是否为Primise类型 */
      if (pendingPromise instanceof Promise) {
        pendingPromise.then(() => {
          /** 由于上一步的onRejected和onResolve回调都没有显式返回值，所以只会进入当前的onResolved */
          /** 不论上一步成功与否，都重置currentRunningFetchIndex 并且重新执行syncFunc */
          currentRunningFetchIndex = 0;
          runSync();
        });
      }
      return {};
    }
  };

  runSync();
}

// test
// runSyncRequest((_fetch) => {
//   const { data: widgets } = _fetch(`${API_PREFIX}/widgets/as-list`, {
//     method: 'GET',
//   });
//   console.log('widgets请求完成，结果: ', widgets);
//   const { data: dashboards } = _fetch(`${API_PREFIX}/dashboards/as-list`, {
//     method: 'GET',
//   });
//   console.log('dashboards请求完成，结果: ', dashboards);
// });
