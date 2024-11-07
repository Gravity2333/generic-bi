import {
  Controller,
  Get,
  Inject,
  Provide,
} from "@midwayjs/decorator";
import { Context } from "egg";
import { OsService } from "../service/os";

@Provide()
@Controller("/web-api/v1")
export class OsController {
  @Inject()
  ctx: Context;

  @Inject()
  osService: OsService;

  @Get("/os-info")
  async EqueryOsInfo() {
    return this.osService.queryOsInfo()
  }
}
