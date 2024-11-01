import { Inject, Logger, Provide } from "@midwayjs/decorator";
import { IMidwayLogger } from "@midwayjs/logger";
import { Context, IMidwayWebNext, IWebMiddleware } from "@midwayjs/web";
import { GlobalService } from "../service/global";
import { ELogOperateSource, SystemLogService } from "../service/systemLog";

/** 配置logger拦截器 */
@Provide("sysLoggerMiddleware")
export class jwtAuthMiddleware implements IWebMiddleware {
  @Inject()
  globalService: GlobalService;

  @Inject()
  systemLogService: SystemLogService;

  @Logger()
  readonly logger: IMidwayLogger;

  resolve() {
    return async (ctx: Context, next: IMidwayWebNext) => {
      ctx.sysLogger = new Function();
      if (!ctx.path.includes("/web-api/")) {
        await next();
        return;
      }

      if (!["POST", "PUT", "DELETE"]?.includes(ctx.method)) {
        await next();
        return;
      }

      const userInfo = ctx.userInfo;

      if (!userInfo) {
        await next(); // 这里因为next之后的操作是异步的所以需要加 await
        return;
      }
      
      /** 仅对增删改增加日志，查询记录日志 */
      try {
        const userInfo = ctx.userInfo;
        const sysLogger = this.systemLogService.loggerCreator({
          source: ELogOperateSource.USER,
          address: userInfo.address,
          username: userInfo.username,
        });
        ctx.sysLogger = sysLogger;
      } catch (e) {
        // 处理构建syslogger时错误
        await next();
      }

      // 全处理完成 继续下一步
      await next();
    };
  }
}
