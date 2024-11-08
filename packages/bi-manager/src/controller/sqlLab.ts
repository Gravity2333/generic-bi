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
  Query,
  Validate,
} from "@midwayjs/decorator";
import {
  Utils,
  base64Encode,
  // base64Encode,
  downloadWidgetCSV,
  downloadWidgetExcel,
} from "../utils";
import { Context } from "joi";
import { Readable } from "typeorm/platform/PlatformTools";
import { KEEP_RESPONSE_RAW } from "../middleware/responseHandler";
import { CreateWidgetInput } from "../dto/widget.dto";
import { SqlLabService } from "../service/sqlLab";
import { ValidationError } from "sequelize";
import { DatabaseService } from "../service/database";

@Provide()
@Controller("/web-api/v1")
export class SqlLabController {
  @Inject()
  databaseService: DatabaseService;
  
  @Inject()
  ctx: Context;

  @Inject()
  sqlLabService: SqlLabService;

  @Inject()
  utils: Utils;

  @Get("/sql-json/explore")
  async sqlJsonExplore(
    @Query(ALL)
    { queryId, sql }: { sql: string; queryId?: string }
  ) {
    try {
      const securityQueryId = queryId ? `/*${base64Encode(queryId)}*/ ` : "";
      const fullSql =
        (sql[sql?.length - 1] === ";" ? sql?.slice(0, -1) : sql) +
        securityQueryId;
      let sqlData: any = null;
      try {
        sqlData = await this.databaseService.executeSql(fullSql,'');
      } catch (e) {
        try {
          sqlData = await this.databaseService.executeSql(fullSql,'');
        } catch (error) {
          throw new Error(error);
        }
      }
      return {
        success: true,
        data: sqlData,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  @Get("/sql-json/as-list")
  async listAllSqlJson() {
    return await this.sqlLabService.listAllSqlJson();
  }

  @Post("/sql-json")
  @Validate()
  async createSqlJson(@Body(ALL) createParam: CreateWidgetInput) {
    try {
      const param = await this.sqlLabService.createSqlJson(createParam);
      const id = param?.getDataValue("id");
      const ids = await this.utils.sqlJsonSeqService.get();
      const idList = (ids?.split(",") || [])?.filter((f) => f);
      idList.push(id);
      this.utils.sqlJsonSeqService.set(idList.join(","));
      return param;
    } catch (error) {
      if (error instanceof ValidationError) {
        this.ctx?.throw(500, "Params Validation Error");
      } else {
        this.ctx?.throw(500, error);
      }
    }
  }

  @Put("/sql-json/:id")
  @Validate()
  async updateSqlJson(
    @Param() id: string,
    @Body(ALL) updateParam: CreateWidgetInput
  ) {
    try {
      return await this.sqlLabService.updateSqlJson({
        ...updateParam,
        id,
      });
    } catch (error) {
      if (error instanceof ValidationError) {
        this.ctx?.throw(500, "Params Validation Error");
      } else {
        this.ctx?.throw(500, error);
      }
    }
  }

  @Del("/sql-json/:id")
  async deleteSQlJson(@Param() id: string) {
    return await this.sqlLabService.deleteSqlJson(id);
  }

  @Get("/sql-json/export")
  async exportSqlJson(
    @Query(ALL) { sql, type }: { sql: string; type: "csv" | "excel" }
  ) {
    try {
      let dataList: Record<string, any>[] = null;
      try {
        dataList = await this.databaseService.executeSql(sql,'');
      } catch (e) {
        try {
          dataList = await this.databaseService.executeSql(sql,'');
        } catch (error) {
          this.ctx?.throw(500, error);
        }
      }
      if (type === "csv") {
        if (dataList[0]) {
          const titleNameList: string[] = Object.keys(dataList[0]);
          const csv = downloadWidgetCSV({
            titleNameList,
            dataList,
          });
          const stream = Readable.from(csv);
          this.ctx.set(KEEP_RESPONSE_RAW, "1");
          this.ctx.set("Content-Disposition", `attachment; filename=${encodeURIComponent(`${"untitled"}.csv`)}`);
          this.ctx.set("Content-Type", "application/csv");
          this.ctx.body = stream;
          this.ctx.status = 200;
        }
      } else if (type === "excel") {
        if (dataList[0]) {
          const titleNameList: string[] = Object.keys(dataList[0]);
          const list: any[] = [];
          for (let item of dataList) {
            list.push(titleNameList?.map((n) => item[n]));
          }
          const excel = await downloadWidgetExcel([
            {
              sheetName: "untitled",
              titleNameList,
              dataList: list,
            },
          ]);
          const stream = Readable.from(excel);
          this.ctx.set(KEEP_RESPONSE_RAW, "1");
          this.ctx.set("Content-Disposition", `attachment; filename=${encodeURIComponent(`${"untitled"}.xlsx`)}`);
          this.ctx.set("Content-Type", "application/xlsx");
          this.ctx.body = stream;
          this.ctx.status = 200;
        }
      } else {
        throw new Error("参数: type 填写错误!");
      }
    } catch (error) {
      this.ctx?.throw(500, error);
    }
  }

  @Post("/sql-json/seq")
  @Validate()
  async setSqlJsonSeq(@Body(ALL) { ids }: { ids: string }) {
    try {
      await this.utils.sqlJsonSeqService.set(ids);
    } catch (error) {
      this.ctx?.throw(500, error);
    }
  }
}
