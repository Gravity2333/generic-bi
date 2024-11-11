import {
  ALL,
  Body,
  Controller,
  Get,
  Inject,
  Post,
  Provide,
} from "@midwayjs/decorator";
import { Context } from "@midwayjs/web";
import { Utils } from "../utils";

@Provide()
@Controller("/web-api/v1")
export class LayoutController {

  @Inject()
  ctx: Context;

  @Inject()
  utils: Utils;

  @Post("/layout/title")
  async setTitle(@Body(ALL) { title }: { title: string }) {
    return await this.utils.sysTitleService.set(title);
  }

  @Get("/layout/title")
  async getTitle() {
    return await this.utils.sysTitleService.get();
  }
}
