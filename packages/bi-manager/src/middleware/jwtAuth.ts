import { Config, Inject, Logger, Provide } from "@midwayjs/decorator";
import { Context, IMidwayWebNext, IWebMiddleware } from "@midwayjs/web";
import { GlobalService } from "../service/global";
import { IMidwayLogger } from "@midwayjs/logger";
import { JwtService } from "../service/jwt";

@Provide("jwtAuthMiddleware")
export class jwtAuthMiddleware implements IWebMiddleware {
  @Config("isDev")
  isDev: boolean;

  @Inject()
  jwtService: JwtService;

  @Inject()
  globalService: GlobalService;

  @Logger()
  readonly logger: IMidwayLogger;

  resolve() {
    return async (ctx: Context, next: IMidwayWebNext) => {
      if (!ctx.path.includes("/web-api/")) {
        await next();
        return;
      }

      // 判断是否需要拦截
      if (ctx.path.includes("/jwt/generate")) {
        await next();
        return;
      }

      if (ctx.path.includes("/login") || ctx.path.includes("/register")) {
        await next();
        return;
      }

      try {
        const [, token] = (
          ctx.get("Authorization") || ctx.get("authorization")
        ).split(" ");
      
        if (!token) {
          ctx?.throw(401, "授权失败");
        }

        const userInfo = await this.jwtService.parseToken(token);
        ctx.userInfo = userInfo;
      } catch (err) {
        console.log(err)
        ctx?.throw(401, "授权失败");
      }
      // 全处理完成 继续下一步
      await next();
    };
  }
}
