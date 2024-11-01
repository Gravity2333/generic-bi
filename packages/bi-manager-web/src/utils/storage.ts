function put(key: string, value: any) {
  window.localStorage.setItem(key, value);
}

function get(key: string) {
  return window.localStorage.getItem(key);
}

function remove(key: string) {
  return window.localStorage.removeItem(key);
}

function clear() {
  window.localStorage.clear();
}

export default {
  put,
  get,
  remove,
  clear,
};
