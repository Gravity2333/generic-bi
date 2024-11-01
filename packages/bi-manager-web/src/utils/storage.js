function put(key, value) {
  window.localStorage.setItem(key, value);
}

function get(key) {
  return window.localStorage.getItem(key);
}

function remove(key) {
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
