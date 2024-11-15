import {
  ALL,
  Body,
  Controller,
  Del,
  Get,
  Inject,
  Param,
  Post,
  Provide,
  Put,
  Validate,
} from "@midwayjs/decorator";
import { Context } from "egg";
import { ValidationError } from "joi";
import { ELogOperareTarget, ELogOperareType } from "../service/systemLog";
import { DatabaseService } from "../service/database";
import { CreateDatabseInput, UpdateDatabseInput } from "../dto/database.dto";

@Provide()
@Controller("/web-api/v1")
export class DatabseAPIController {
  @Inject()
  ctx: Context;

  @Inject()
  databaseService: DatabaseService;

  @Get("/database/list")
  async queryDatabasesInfo() {
    return this.databaseService.getDatabases();
  }

  @Get("/database/:id")
  @Validate()
  async queryDatabaseInfobyId(@Param() id: string) {
    return this.databaseService.getDatabaseById(id);
  }

  @Post("/database")
  @Validate()
  async createDatabase(@Body(ALL) createParam: CreateDatabseInput) {
    try {
      const res = await this.databaseService.createDatabse(createParam);
      if (this.ctx.sysLogger && typeof this.ctx.sysLogger === "function") {
        this.ctx.sysLogger({
          content: `新增数据库配置: ${createParam.type}`,
          type: ELogOperareType.CREATE,
          target: ELogOperareTarget.DATABASE,
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

  @Put("/database/:id")
  @Validate()
  async updateDatabase(
    @Param() id: string,
    @Body(ALL) updateParam: UpdateDatabseInput
  ) {
    try {
      const res = await this.databaseService.updateDatabase(updateParam);
      if (this.ctx.sysLogger && typeof this.ctx.sysLogger === "function") {
        this.ctx.sysLogger({
          content: `修改数据库配置: ${updateParam.type}`,
          type: ELogOperareType.CREATE,
          target: ELogOperareTarget.DATABASE,
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

  @Del("/database/:id")
  async deleteWidget(@Param() id: string) {
    return await this.databaseService.deleteDatabase(id);
  }
}
