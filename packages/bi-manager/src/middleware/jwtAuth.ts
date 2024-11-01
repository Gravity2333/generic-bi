import { Config, Inject, Logger, Provide } from "@midwayjs/decorator";
import { JwtService } from "@midwayjs/jwt";
import { Context, IMidwayWebNext, IWebMiddleware } from "@midwayjs/web";
import { IJwtConfig } from "../interface";
import { GlobalService } from "../service/global";
import { IMidwayLogger } from "@midwayjs/logger";

@Provide("jwtAuthMiddleware")
export class jwtAuthMiddleware implements IWebMiddleware {
  @Inject()
  jwt: JwtService;

  @Config("isDev")
  isDev: boolean;

  @Config("jwt")
  jwtconfig: IJwtConfig;

  @Inject()
  globalService: GlobalService;

  @Logger()
  readonly logger: IMidwayLogger;

  resolve() {
    return async (ctx: Context, next: IMidwayWebNext) => {
      // jwt 默认启用
      // if (!this.jwtconfig.enabled) {
      //   await next();
      //   return;
      // }

      // 开发模式下跳过
      if (this.isDev) {
        await next();
        return;
      }

      if (!ctx.path.includes("/web-api/")) {
        await next();
        return;
      }

      // 判断是否需要拦截
      if (ctx.path.includes("/jwt/generate")) {
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

        const userInfo = await this.globalService.parseToken(token);
        ctx.userInfo = userInfo;
      } catch (err) {
        ctx?.throw(401, "授权失败");
      }
      // 全处理完成 继续下一步
      await next();
    };
  }
}
