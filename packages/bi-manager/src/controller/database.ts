import {
  ALL,
  Body,
  Controller,
  Get,
  Inject,
  Post,
  Provide,
  Validate,
} from "@midwayjs/decorator";
import { Context } from "egg";
import { ValidationError } from "joi";
import { ELogOperareTarget, ELogOperareType } from "../service/systemLog";
import { DatabaseService } from "../service/database";
import { UpdateDatabseInput } from "../dto/database.dto";


@Provide()
@Controller("/web-api/v1")
export class DatabseAPIController {
  @Inject()
  ctx: Context;

  @Inject()
  databaseService: DatabaseService;

  @Get("/database/info")
  async queryDatabaseInfo() {
    return this.databaseService.getInfo();
  }

  @Get("/database/check")
  async checkDatabasConnect() {
    return this.databaseService.checkConnect();
  }

  @Post("/database/info")
  @Validate()
  async configWidget(@Body(ALL) createParam: UpdateDatabseInput) {
    try {
      const res = await this.databaseService.configDatabase(createParam);
      if (this.ctx.sysLogger && typeof this.ctx.sysLogger === "function") {
        this.ctx.sysLogger({
          content: `配置数据库: ${createParam.type}`,
          type: ELogOperareType.CREATE,
          target: ELogOperareTarget.WIDGET,
        });
      }
      return res;
    } catch (error) {
      if (error instanceof ValidationError) {
        this.ctx?.throw(500, "Params Validation Error");
      } else {
        this.ctx?.throw(500, error);
      }
    }
  }

}
