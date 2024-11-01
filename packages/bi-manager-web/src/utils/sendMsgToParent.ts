export function sendMsgToParent(param: Record<string, any>, callback?: any) {
  const sendObj = {
    param,
  };
  window.parent.postMessage(sendObj, '*');
  if (callback) {
    callback();
  }
}

export function jumpToParent(url: string, param: Record<string, any>, newTab = false) {
  sendMsgToParent({
    url,
    ...param,
    newTab,
  });
}
