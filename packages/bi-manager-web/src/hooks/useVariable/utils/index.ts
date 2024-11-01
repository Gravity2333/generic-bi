import { Action, StoreConfig, StoreObject, Type, USE_STORE_TYPE_SPLITER } from "../hooks/useStore/typings";
import { UseVariableParams } from "../typings";

export function capitalizeFirstLetter(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export const VARIABLE_STORE_NAME = 'VARIABLES';

export function _GenerateStoreReducerName(reducerName: string) {
  return `${VARIABLE_STORE_NAME}${USE_STORE_TYPE_SPLITER}${reducerName}`;
}

export function _GeneraterDefaultSetterName(variableName: string) {
  return `set${capitalizeFirstLetter(variableName)}`;
}

/** 生成useStore参数内容 */
export function _GenerateStoreConfig(variableParams: UseVariableParams) {
  const storeConfig: StoreConfig = {
    name: VARIABLE_STORE_NAME,
    initialValue: {},
    reducers: {},
    effects: {},
  };
  const { variables = {}, reducers = {}, effects = {} } = variableParams;
  Object.keys(variables).forEach((variableName) => {
    const variableInitialValue = (variables as Record<Type, any>)[variableName];
    /** 处理初始值 */
    Object.defineProperty(storeConfig.initialValue, variableName, {
      value: variableInitialValue,
      configurable: true,
      enumerable: true,
      writable: true,
    });
    /** 生成setter reducer*/
    Object.defineProperty(storeConfig.reducers, _GeneraterDefaultSetterName(variableName), {
      configurable: true,
      enumerable: true,
      writable: true,
      value: (state: StoreObject, action: Action) => {
        state[variableName] =  action.payload
      },
    });
  });
  /** 处理reducers */
  Object.keys(reducers).forEach((reducerName) => {
    Object.defineProperty(storeConfig.reducers, reducerName, {
      configurable: true,
      enumerable: true,
      writable: true,
      value: reducers[reducerName],
    });
  });
  /** 处理effects */
  Object.keys(effects).forEach((effectName) => {
    Object.defineProperty(storeConfig.effects, effectName, {
      configurable: true,
      enumerable: true,
      writable: true,
      value: effects[effectName],
    });
  });
  return storeConfig;
}
