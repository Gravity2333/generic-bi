export const isIframeEmbed = window.self !== window.top;

/**
 * 停止 ajax
 * @param apis 需要停止的
 */
export const abortAjax = (apis: string[]) => {
    if (apis.length === 0) {
      return;
    }
    const { cancelRequest = new Map() } = window as any;
    cancelRequest.forEach((value: any, key: string) => {
      for (let i = 0; i < apis.length; i += 1) {
        const startIndex = value.apiUri.indexOf(apis[i]);
        if (startIndex !== -1 && startIndex + apis[i].length === value.apiUri.length) {
          // 取消ajax请求
          value.ajax.abort();
          // 删除
          cancelRequest.delete(key);
        }
      }
    });
  };



export function throttle(func: any,delay: number,onTimeout?: any){
  let timeObj: any = null
  return (...args: any)=>{
    if(!timeObj){
      func(...args)
      timeObj = setTimeout(() => {
        timeObj = ''
        onTimeout&&onTimeout()
      }, delay);
    }
  }
}