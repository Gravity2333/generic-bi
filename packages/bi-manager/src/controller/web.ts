import { Controller, Get, Inject, Provide } from "@midwayjs/decorator";
import { Context } from "egg";

@Provide()
@Controller("/")
export class WebPageController {
  @Inject()
  ctx: Context;

  @Get("/*")
  async render() {
    await this.ctx.render("index.html");
  }
}
