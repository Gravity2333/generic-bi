import { useMemo } from 'react';
import useStore from './hooks/useStore';
import type { Dispatch, StoreObject, Type } from './hooks/useStore/typings';
import type { UseVariableParams } from './typings';
import { _GenerateStoreConfig, _GenerateStoreReducerName, VARIABLE_STORE_NAME } from './utils';

/** 对useStore一层封装，简化其配置 */
function useVariable<VariableTypes extends StoreObject>(
  creator: UseVariableParams,
): [VariableTypes, Dispatch, (type: Type) => boolean];
function useVariable<VariableTypes extends StoreObject>(
  creator: (...args: any[]) => UseVariableParams,
  ...args: any[]
): [VariableTypes, Dispatch, (type: Type) => boolean];
function useVariable<VariableTypes extends StoreObject>(
  creator: UseVariableParams | ((...p: any[]) => UseVariableParams),
  ...args: any[]
) {
  const storeConfig = useMemo(() => {
    if (typeof creator === 'function') {
      return creator(...args);
    } else {
      return creator;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [_store, _storeDispatch, _storeLoading] = useStore<VariableTypes>({
    config: [_GenerateStoreConfig(storeConfig)],
  });

  const dispatch = (action: { type: Type; payload?: any }) => {
    return _storeDispatch(
      {
        type: _GenerateStoreReducerName(action.type),
        payload: action.payload,
      },
      dispatch,
    );
  };

  const loading = (type: Type) => {
    return _storeLoading(_GenerateStoreReducerName(type));
  };

  return [_store[VARIABLE_STORE_NAME], dispatch, loading] as [
    VariableTypes,
    Dispatch,
    (type: Type) => boolean,
  ];
}

export * from './typings';
export * from './hooks/useStore';
export * from './hooks/useForceUpdate';
export default useVariable;
