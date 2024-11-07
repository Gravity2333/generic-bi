import {
  Controller,
  Get,
  Inject,
  Provide,
} from "@midwayjs/decorator";
import { Context } from "egg";
import { NpmdDictService } from "../service/dicts";
import { GlobalService } from "./../service/global";

@Provide()
@Controller("/web-api/v1")
export class ApiController {
  @Inject()
  ctx: Context;

  @Inject()
  globalService: GlobalService;


  @Inject()
  npmdDictService: NpmdDictService;

  @Get("/*")
  async Error404() {
    return this.ctx?.throw(404, `[API Not Found] ${this.ctx.request.URL}`);
  }
}
