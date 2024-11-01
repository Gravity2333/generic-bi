import { Provide } from "@midwayjs/decorator";
import { IWebMiddleware, IMidwayWebNext } from "@midwayjs/web";
import { Context } from "egg";

export const KEEP_RESPONSE_RAW = "response-not-wrapper";
@Provide("responseMiddleware")
export class ResponseMiddleware implements IWebMiddleware {
  resolve() {
    return async (ctx: Context, next: IMidwayWebNext) => {
      await next();

      // 如果显式指定不进行格式封装
      if (
        ctx.request.url.indexOf("/web-api/") === -1 ||
        ctx.response.get(KEEP_RESPONSE_RAW)
      ) {
        return;
      }

      ctx.body = {
        success: true,
        message: "success",
        data: ctx.body,
      };

      // 防止 koa 内部将状态修改为 204 导致 body 为空的问题
      // @see: https://github.com/midwayjs/midway/issues/1152#issuecomment-880373716
      ctx.status = 200;
    };
  }
}
