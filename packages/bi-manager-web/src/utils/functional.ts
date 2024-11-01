export function pip(funcs: any[]) {
  return (input: any) => {
    return funcs.reduce((prev, curr) => {
      return curr(prev);
    }, input);
  };
}

export function compose(funcs: any[]) {
  return (input: any) => {
    return funcs.reduceRight((prev, curr) => {
      return curr(prev);
    }, input);
  };
}

export function curry(func: any, args: any[] = []) {
  return (param: any) => {
    if (args.length >= func.length - 1) {
      return func(...args, param);
    } else {
      return curry(func, [...args, param]);
    }
  };
}

export function debounce(func: any, delay: number) {
  let timeoutObj: any = '';
  return (...args: any) => {
    clearTimeout(timeoutObj);
    timeoutObj = setTimeout(() => {
      func(...args);
    }, delay);
  };
}

export function throttle(func: any, delay: number) {
  let timeoutObj: any = '';
  return (...args: any) => {
    if (!timeoutObj) {
      func(...args);
      timeoutObj = setTimeout(() => {
        timeoutObj = '';
      }, delay);
    }
  };
}

interface ICache {
  status: 'pending' | 'fulfilled' | 'rejected';
  data?: any;
  error?: string;
}

type IAsyncFunc = (syncFunc: any, resolve: any) => void;

/**代数效应
 * 创建一个异步处理函数
 * @param inputAsyncFunc: 异步函数
 * @return 使用该函数的异步运行函数
 */
// eslint-disable-next-line @typescript-eslint/ban-types
export function createAsyncAlgebraicEffect() {
  return function runAsync(func: IAsyncFunc) {
    return new Promise<any>((resolve) => {
      const caches: ICache[] = [];
      let workInProgressIndex = 0;
      function asyncFunc(inputAsyncFunc: () => Promise<any>, ...rest: any[]) {
        const currentCache = caches[workInProgressIndex];
        if (currentCache) {
          if (currentCache.status === 'fulfilled') {
            workInProgressIndex++;
            // 缓存中存在数据 交付
            return currentCache.data;
          } else if (currentCache.status === 'rejected') {
            throw new Error(currentCache.error);
          }
        } else {
          // 不存在数据，发送请求并且throw promise
          const result: ICache = {
            status: 'pending',
          };
          caches[workInProgressIndex++] = result;
          // @ts-ignore
          // eslint-disable-next-line @typescript-eslint/no-throw-literal
          throw inputAsyncFunc(...rest).then(
            (res: any) => {
              result.status = 'fulfilled';
              result.data = res;
            },
            (err: string) => {
              result.status = 'rejected';
              result.error = err;
            },
          );
        }
      }

      function handleCatch(handleFunc: IAsyncFunc) {
        try {
          handleFunc(asyncFunc, resolve);
        } catch (p) {
          if (p instanceof Promise) {
            const handleThen = () => {
              workInProgressIndex = 0;
              handleCatch(handleFunc);
            };
            p.then(handleThen, handleThen);
          }
        }
      }

      handleCatch(func);
    });
  };
}

/* 使用方式
const algebraicEffect =  createAsyncAlgebraicEffect()
algebraicEffect(foo)
// 同步函数foo 不需要加async await
function foo(sync,finish){
  // foo函数会被传入两个函数
  // sync为同步转换器 使用方法为 const result = sync(异步函数 如: ajax,异步函数参数) result可以直接拿到返回结果
  // 在函数内容执行完之后 需要手动调用finish函数来返回结果
}
algebraicEffect(foo) 返回一个promise
*/
