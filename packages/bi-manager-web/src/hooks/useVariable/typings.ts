import { Effect, Reducer } from "./hooks/useStore/typings";

export interface UseVariableParams {
  /** 变量，及其初始化值
   * 注意，初始值的类型不可变
   */
  variables: Record<string,any>
  reducers?: Record<string, Reducer>;
  effects?: Record<string, Effect>;
}

