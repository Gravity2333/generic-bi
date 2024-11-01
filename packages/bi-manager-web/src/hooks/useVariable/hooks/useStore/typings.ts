import type { Call } from './libs/task';
/** 存储对象 */
export type StoreObject = Record<Type, any>;

/** 类型 */
export type Type = string;

/** action对象 */
export type Action = {
  type?: Type;
  payload?: any;
};

/** reducer函数 */
export type Reducer = (state: StoreObject, action: Action) => StoreObject | void;

/** dispatch函数 */
export type Dispatch = (
  action: { type: Type; payload?: any },
  outerDitch?: Dispatch,
) => Promise<any>;

export type TaskControl = {
  return: (val: any) => void;
  error: (reason: any) => void;
};

/** 副作用 */
export type Effect = (
  _operators: {
    call: Call;
    setLoading: (loading: boolean) => void;
    /** 任务流程控制器，负责结束任务或者抛出异常 */
    Control: TaskControl;
  },
  _store: {
    store: StoreObject;
    dispatch: Dispatch;
  },
  payload?: any,
  promisevalue?: {
    resolve: (val: any) => void;
    reject: (reason: any) => void;
  },
) => void;

/** 仓库配置 */
export type StoreConfig = {
  name: string;
  /** 初始值 */
  initialValue?: StoreObject;
  /** 归纳器 */
  reducers?: Record<Type, Reducer>;
  /** 副作用 */
  effects?: Record<Type, Effect>;
};

export const USE_STORE_TYPE_SPLITER = '/';
