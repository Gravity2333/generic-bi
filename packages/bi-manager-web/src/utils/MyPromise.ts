/** 实现一个Promise */
/** Promise状态枚举 */
enum EMyPromiseState {
  /** 未决策状态 */
  'PENDING' = 'pending',
  /** 成功状态 */
  'FULFILLED' = 'fulfilled',
  /** 拒绝状态 */
  'REJECTED' = 'rejected',
}

/** 成功回调类型 */
type OnFulfilled = (value?: any) => any;

/** 失败回调类型 */
type OnRejected = (reason?: any) => any;

/** 执行器 */
type Executor = (resolve: OnFulfilled, reject: OnRejected) => void;

/** MyPromise类型 */
interface IMyPromise {
  /** 状态 */
  state: EMyPromiseState;
  /** 值 ｜ 错误原因 */
  value: any;
  /** then方法，满足thenable协议 */
  then: (onfulfilled?: OnFulfilled, onRejected?: OnRejected) => IMyPromise;
  /** catch方法 */
  catch: (catchHandler: (err: any) => void) => void;
  /** finally 方法 */
  finally: (finallyHandler: () => void) => void;
  /** ---- 静态方法 ---- */
  /** 返回成功MyPromise */
  readonly resolve?: (value: any) => IMyPromise;
  /** 返回失败MyPromise */
  readonly reject?: (value: any) => IMyPromise;
  /** all方法 */
  readonly all?: (myPromises: IMyPromise[]) => IMyPromise;
  /** any方法 */
  readonly any?: (myPromises: IMyPromise[]) => IMyPromise;
  /** race方法 */
  readonly race?: (myPromises: IMyPromise[]) => IMyPromise;
  /** allSettled方法 */
  readonly allSettled?: (myPromises: IMyPromise[]) => IMyPromise[];
}

class MyPromise implements IMyPromise {
  /** 成功回调缓存 */
  private onFulfilledCallbacks: VoidFunction[] = [];
  /** 失败回调缓存 */
  private onRejectedCallbacks: VoidFunction[] = [];
  /** 状态 */
  public state: EMyPromiseState = EMyPromiseState.PENDING;
  /** value */
  public value: any;

  /** 用来判断promise是否已经决策 */
  private _isMyPrimiseDecided() {
    return this.state !== EMyPromiseState.PENDING;
  }

  /** 用来决策成功promise实现 */
  private _resolvePromiseImpl = (value: any) => {
    this.value = value;
    this.state = EMyPromiseState.FULFILLED;
    this.onFulfilledCallbacks.forEach((onFulfilledCallback) => {
      onFulfilledCallback();
    });
  };

  /** 用来拒绝promise实现 */
  private _rejectPromiseImpl = (reason: any) => {
    /** 设置失败reason和状态 */
    this.value = reason;
    this.state = EMyPromiseState.REJECTED;
    /** 此时回调缓存可能有挂着的任务，执行*/
    this.onRejectedCallbacks.forEach((onRejectedCallback) => {
      onRejectedCallback();
    });
  };

  /** 用来决策成功promise */
  private _resolvePromise(inputVal?: any) {
    if (!this._isMyPrimiseDecided()) {
      /** promise状态只可以变化一次 */
      /** duck检测 */
      if (MyPromise._duckTest(inputVal)) {
        MyPromise.resolve(inputVal).then(this._resolvePromiseImpl, this._rejectPromiseImpl);
      } else {
        this._resolvePromiseImpl(inputVal);
      }
    }
  }

  /** 用来拒绝promise */
  private _rejectPromise(reason?: any) {
    if (!this._isMyPrimiseDecided()) {
      /** promise状态只可以变化一次 */
      this._rejectPromiseImpl(reason);
    }
  }

  /** ctor 穿入执行器函数 */
  public constructor(executor: Executor) {
    try {
      /** 为了实现执行器内抛出异常自动拒绝 */
      executor(this._resolvePromise.bind(this), this._rejectPromise.bind(this));
    } catch (reason) {
      this._rejectPromise(reason);
    }
  }

  /** then方法 */
  public then(
    onfulfilled: OnFulfilled = (value) => value, // 设置默认
    onRejected: OnRejected = (reason) => {
      //设置默认，这里为了可以把错误传递下去
      throw reason;
    },
  ) {
    return new MyPromise((resolve, reject) => {
      const thenTask = (state: EMyPromiseState = EMyPromiseState.FULFILLED) => {
        queueMicrotask(
          function () {
            try {
              /** 获得 onfulfilled / onRejected 返回的原始值  */
              const thenOriginResult =
                state === EMyPromiseState.FULFILLED
                  ? //@ts-ignore
                    onfulfilled(this.value)
                  : //@ts-ignore
                    onRejected(this.value);
              //@ts-ignore
              if ((this as unknown as IMyPromise) === thenOriginResult) {
                throw new Error('then方法不能返回当前MyPromise对象！');
              }

              /** duck检测 */
              if (MyPromise._duckTest(thenOriginResult)) {
                MyPromise._handleThenable(thenOriginResult, resolve, reject);
              } else {
                /** 都不是 按照普通类型处理 */
                resolve(thenOriginResult);
              }
            } catch (err) {
              reject(err);
            }
          }.bind(this),
        );
      };
      if (this._isMyPrimiseDecided()) {
        /** 当promise已经决策, 直接运行onfulfilled/onRejected */
        thenTask(this.state);
      } else {
        /** 未决策，加入对应队列 两个都加入*/
        this.onFulfilledCallbacks.push(thenTask.bind(this, EMyPromiseState.FULFILLED));
        this.onRejectedCallbacks.push(thenTask.bind(this, EMyPromiseState.REJECTED));
      }
    });
  }

  /** 最后处理错误 */
  public catch(catchHandler: (err: any) => void = () => {}) {
    /** 相当于仅调用失败的promise */
    return this.then(
      (val) => val,
      (err) => {
        catchHandler(err);
      },
    );
  }

  /** 最终处理 */
  public finally(finallyHandler: () => any = () => {}) {
    this.then(
      () => {
        finallyHandler();
      },
      () => {
        finallyHandler();
      },
    );
  }

  /** 鸭子检测：
   *  thenable协议： 对象/函数上包含then函数即可
   */
  private static _duckTest(thenable: any) {
    return (
      thenable &&
      (typeof thenable === 'function' || typeof thenable === 'object') &&
      typeof thenable.then === 'function'
    );
  }

  /** 递归处理thenable */
  private static _handleThenable(thenableObj: any, resolve: OnFulfilled, reject: OnRejected) {
    if (thenableObj instanceof MyPromise) {
      return thenableObj.then(resolve, reject);
    } else if (typeof thenableObj.then === 'function') {
      return thenableObj.then(
        (val: any) => {
          MyPromise._handleThenable(val, resolve, reject);
        },
        (reason: any) => {
          reject(reason);
        },
      );
    } else {
      return resolve(thenableObj);
    }
  }

  /** 返回一个成功的MyPromise */
  /** 过滤thenable
   * 1. 如果是MyPrimise类型，判读是否是当前myPromise，防止形成环,是则报错，否则直接返回
   * 2. duck检测，检查是不是thenable，是则封装成MyPromise 否则直接封装到成功的MyPromise
   */
  public static resolve(value?: any) {
    /** duck检测 */
    if (MyPromise._duckTest(value)) {
      return new MyPromise((resolve, reject) => {
        MyPromise._handleThenable(value, resolve, reject);
      });
    }

    /** 都不是 按照普通类型处理 */
    return new MyPromise((resolve) => {
      resolve(value);
    });
  }

  /** 返回一个失败的MyPromise */
  public static reject(reason?: any) {
    return new MyPromise((_, reject) => {
      reject(reason);
    });
  }

  public static all(myPromises: IMyPromise[]) {
    const resultList: any[] = [];
    let fulfilledCnt = 0;
    return new MyPromise((resolve, reject) => {
      for (let i = 0; i < myPromises.length; i++) {
        const myPrimise = myPromises[i];
        myPrimise.then(
          (value) => {
            resultList[i] = value;
            if (++fulfilledCnt === myPromises.length) {
              resolve(resultList);
            }
          },
          () => {
            reject();
          },
        );
      }
    });
  }

  public static any(myPromises: IMyPromise[]) {
    const AggregateError: any[] = [];
    let rejectedCnt = 0;

    return new MyPromise((resolve, reject) => {
      for (let i = 0; i < myPromises.length; i++) {
        const myPrimise = myPromises[i];
        myPrimise.then(
          (val) => {
            resolve(val);
          },
          (reason) => {
            AggregateError[i] = reason;
            if (++rejectedCnt === myPromises.length) {
              reject(AggregateError);
            }
          },
        );
      }
    });
  }

  public static race(myPromises: IMyPromise[]) {
    return new MyPromise((resolve, reject) => {
      myPromises.forEach((myPromise) => {
        myPromise.then(resolve, reject);
      });
    });
  }

  public static allSettled(myPromises: IMyPromise[]) {
    const resultList: any[] = [];
    let decideCnt = 0;
    return new MyPromise((resolve) => {
      for (let i = 0; i < myPromises.length; i++) {
        const myPrimise = myPromises[i];
        myPrimise.then(
          (val) => {
            resultList[i] = {
              status: EMyPromiseState.FULFILLED,
              value: val,
            };
            if (++decideCnt === myPromises.length) {
              resolve(resultList);
            }
          },
          (reason) => {
            resultList[i] = {
              status: EMyPromiseState.REJECTED,
              value: reason,
            };
            if (++decideCnt === myPromises.length) {
              resolve(resultList);
            }
          },
        );
      }
    });
  }
}

/** 导出MyPromise */
export default MyPromise;
