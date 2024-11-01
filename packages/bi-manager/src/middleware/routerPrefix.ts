import { Provide } from "@midwayjs/decorator";

@Provide("prefixMiddleware")
export class PrefixMiddleware {
  resolve() {
    return async (ctx, next) => {
      ctx.path = ctx.path.replace(/^\/bi/, "") || "/";
      await next();
    };
  }
}
