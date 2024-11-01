type SetCallback = (
  target: Record<string, any>,
  p: string | symbol,
  newValue: any,
  receiver: any,
) => void;
type GetCallback = (target: any, p: string | symbol, receiver: any) => void;
type DeleteCallback = (target: any, p: string | symbol) => void;
/** 监听函数 */
export function observe(
  obj: Record<string, any>,
  onSet?: SetCallback,
  onGet?: GetCallback,
  onDeleteProperty?: DeleteCallback,
) {
  for (const attributeName in obj) {
    const attribute = obj[attributeName];
    if (typeof attribute === 'object' && attribute !== null) {
      obj[attributeName] = observe(attribute, onSet, onGet, onDeleteProperty);
    }
  }
  return new Proxy(obj, {
    get(target, key, receiver) {
      const res = Reflect.get(target, key, receiver);
      if (onGet) {
        onGet(target, key, receiver);
      }
      return res;
    },
    set(target, key, value, receiver) {
      const res = Reflect.set(target, key, value, receiver);
      if (onSet) {
        onSet(target, key, value, receiver);
      }
      return res;
    },
    deleteProperty(target, key) {
      const res = Reflect.deleteProperty(target, key);
      if (onDeleteProperty) {
        onDeleteProperty(target, key);
      }
      return res;
    },
  });
}
