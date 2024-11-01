import { App, Provide } from "@midwayjs/decorator";
import {
  Application,
  Context,
  IMidwayWebNext,
  IWebMiddleware,
} from "@midwayjs/web";

@Provide("errorHandlerMiddleware")
export class ErrorHandlerMiddleware implements IWebMiddleware {
  @App()
  app: Application;

  resolve() {
    return async (ctx: Context, next: IMidwayWebNext): Promise<void> => {
      try {
        await next();

        if (ctx.status === 404) {
          ctx.body = { success: false, message: "Not Found" };
        }
      } catch (err) {
        // 所有的异常都在 app 上触发一个 error 事件，框架会记录一条错误日志
        ctx.app.emit("error", err, ctx);

        // 生产环境时 500 错误的详细错误内容不返回给客户端，因为可能包含敏感信息
        const errorMsg =
          ctx.status === 500 && this.app.getEnv() === "prod"
            ? "接口出现错误"
            : err.message;

        ctx.body = {
          success: false,
          // 生产环境下屏蔽信息
          message: errorMsg,
        };
        // @see: https://github.com/midwayjs/midway/issues/864
        ctx.status = err.status || 500;
      }
    };
  }
}
