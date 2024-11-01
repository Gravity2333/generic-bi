import { Controller, Inject, Post, Provide } from "@midwayjs/decorator";
import { Context } from "@midwayjs/web";
import { JwtService } from "../service/jwt";

@Provide()
@Controller("/web-api/v1")
export class JwtController {
  @Inject()
  jwtService: JwtService;

  @Inject()
  ctx: Context;

  @Post("/jwt/auth")
  async jwtPassport() {
    return this.ctx.user;
  }

  @Post("/jwt/generate")
  async genJwt() {
    return {
      token: await this.jwtService.generateFixedToken(),
    };
  }
}
