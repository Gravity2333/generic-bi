export type Call = (asyncFunc: (...args: any[]) => Promise<any>, payload?: any) => any;
type Task = (call: Call,resolve: (value: any) => void,reject: (value: any) => void) => void;
type TaskResult = {
  status: 'fulfilled' | 'rejected' | 'pending';
  value?: any;
  error?: any;
};

export function runTask(task: Task) {
  return new Promise((resolve,reject)=>{
    const fetchResults: TaskResult[] = [];
    let currentRunningFetchIndex = 0;
    const call: Call = (asyncFunc, payload) => {
      const fetchResult = fetchResults[currentRunningFetchIndex];
      if (fetchResult) {
        currentRunningFetchIndex++;
        if (fetchResult.status === 'fulfilled') {
          return fetchResult.value;
        } else if (fetchResult.status === 'rejected') {
          throw new Error(fetchResult.error);
        }
      } else {
        const fetchResult = {} as TaskResult;
        fetchResults[currentRunningFetchIndex++] = fetchResult;
        throw asyncFunc(payload).then(
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
  
    const runSync = () => {
      try {
        task(call,resolve,reject);
      } catch (pendingPromise: any) {
        if (pendingPromise instanceof Promise) {
          pendingPromise.then(() => {
            currentRunningFetchIndex = 0;
            runSync();
          });
        }else{
          throw new Error(pendingPromise)
        }
        return {};
      }
    };
  
    runSync();
  })
}
