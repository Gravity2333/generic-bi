import {
  EAttachmentType,
  ESelectType,
  generateReferenceSpecification,
  generateSql,
  getTimeDiff,
  ITimeRange,
} from "@bi/common";
import {
  ALL,
  Body,
  Controller,
  Del,
  Get,
  Inject,
  Logger,
  Param,
  Post,
  Provide,
  Put,
  Query,
  Validate,
} from "@midwayjs/decorator";
import { Context } from "egg";
import { ValidationError } from "joi";
import { Readable } from "nodemailer/lib/xoauth2";
import { CreateWidgetInput, QueryWidgetInput } from "../dto/widget.dto";
import { KEEP_RESPONSE_RAW } from "../middleware/responseHandler";
import { IMidwayLogger } from "@midwayjs/logger";
import { WidgetService } from "../service/widget";
import * as fs from "fs";
import { base64Encode } from "../utils";
import { NpmdDictService } from "../service/dicts";
import { ELogOperareTarget, ELogOperareType } from "../service/systemLog";
import { DatabaseService } from "../service/database";
const formidable = require("formidable");

@Provide()
@Controller("/web-api/v1")
export class WidgetAPIController {
  @Inject()
  ctx: Context;

  @Inject()
  widgetService: WidgetService;

  @Inject()
  databaseService: DatabaseService;

  @Logger()
  readonly logger: IMidwayLogger;

  @Inject()
  npmdDictService: NpmdDictService;

  @Get("/widgets")
  @Validate()
  async listWidgets(@Query(ALL) params: QueryWidgetInput) {
    const { pageNumber = 0, pageSize = 10, name = "" } = params;
    return await this.widgetService.listWidgets(pageNumber, pageSize, name);
  }

  @Get("/widgets/as-list")
  async listAllWidgets() {
    return await this.widgetService.listAllWidgets();
  }

  @Get("/widgets/templates")
  async listAllTemplateWidgets() {
    return await this.widgetService.listAllTemplateWidgets();
  }

  @Get("/widgets/:id")
  async getWidgetById(@Param() id: string) {
    const widget = await this.widgetService.getWidgetById(id);
    return widget ?? {};
  }

  @Post("/widgets")
  @Validate()
  async createWidget(@Body(ALL) createParam: CreateWidgetInput) {
    try {
      const res = await this.widgetService.createWidget(createParam);
      if (this.ctx.sysLogger && typeof this.ctx.sysLogger === "function") {
        this.ctx.sysLogger({
          content: `图表名称: ${createParam.name}`,
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

  @Post("/widgets/as-import")
  @Validate()
  async importWidget() {
    try {
      const form = formidable({ multiples: true });
      const { success, info } = await new Promise<{
        success: boolean;
        info: any;
      }>((resolve, reject) => {
        let fileContent = "";
        form.parse(this.ctx.req, async (error, fields, { file }) => {
          if (error) {
            reject({ success: false, info: error });
          }
          const reader = fs.createReadStream(file.filepath);
          reader.on("data", (chunks) => {
            fileContent += chunks.toString();
          });
          reader.on("close", () => {
            resolve({ success: true, info: fileContent });
          });
        });
      });
      if (!success) {
        throw new Error("file parse error");
      } else {
        /** 插入数据 */
        const widgetList = JSON.parse(info) as any[];
        if (this.ctx.sysLogger && typeof this.ctx.sysLogger === "function") {
          this.ctx.sysLogger({
            content: `上传图表名称: [${widgetList
              .map((d) => d.name)
              .join(",")}]`,
            type: ELogOperareType.IMPORT,
            target: ELogOperareTarget.WIDGET,
          });
        }
        this.widgetService.importWidget(info);
      }
    } catch (error) {
      this.logger.error("[import error]", error);
      this.ctx?.throw(500, error);
    }
  }

  /** 导出图表配置 */
  @Get("/widgets/as-export")
  @Validate()
  async exportWidget(@Query(ALL) params: { ids: string }) {
    try {
      const { ids } = params;
      const widgetLists = await this.widgetService.getWidgetByIds(
        ids?.split(",")
      );
      const stream = Readable.from(
        JSON.stringify(
          widgetLists?.map(({ dataValues }: any) => {
            const res = {
              ...dataValues,
            };
            // delete res.id;
            return res;
          })
        )
      );
      this.ctx.set(KEEP_RESPONSE_RAW, "1");
      this.ctx.set("Content-Type", "application/octet-stream");
      this.ctx.set("Content-Disposition", "attachment; filename=widgets.bi");
      this.ctx.status = 200;
      this.ctx.body = stream;
    } catch (error) {
      this.ctx?.throw(500, error);
    }
  }

  /** 导出图表为CSV/EXCEL */
  @Get("/widgets/:id/export")
  async exportWidgetTable(
    @Param() id: string,
    @Query(ALL)
    params: { type: Exclude<`${EAttachmentType}`, `${EAttachmentType.PDF}`> }
  ) {
    try {
      const { type } = params;
      const [name, file] = await this.widgetService.exportWidgetTable(id, type);
      if (type === EAttachmentType.CSV) {
        const stream = Readable.from(file);
        this.ctx.set(KEEP_RESPONSE_RAW, "1");
        this.ctx.set(
          "Content-Disposition",
          `attachment; filename=${encodeURIComponent(`${name}.csv`)}`
        );
        this.ctx.set("Content-Type", "application/csv");
        this.ctx.body = stream;
        this.ctx.status = 200;
      } else if (type === EAttachmentType.EXCEL) {
        const stream = Readable.from(file);
        this.ctx.set(KEEP_RESPONSE_RAW, "1");
        this.ctx.set(
          "Content-Disposition",
          `attachment; filename=${encodeURIComponent(`${name}.xlsx`)}`
        );
        this.ctx.set("Content-Type", "application/xlsx");
        this.ctx.body = stream;
        this.ctx.status = 200;
      }
    } catch (error) {
      this.ctx?.throw(500, error);
    }
  }

  @Put("/widgets/:id")
  @Validate()
  async updateWidget(
    @Param() id: string,
    @Body(ALL) updateParam: CreateWidgetInput
  ) {
    try {
      const res = await this.widgetService.updateWidget({
        ...updateParam,
        id,
      });
      if (this.ctx.sysLogger && typeof this.ctx.sysLogger === "function") {
        this.ctx.sysLogger({
          content: `图表名称: ${updateParam.name}`,
          type: ELogOperareType.UPDATE,
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

  @Del("/widgets/:id")
  async deleteWidget(@Param() id: string) {
    return await this.widgetService.deleteWidget(id);
  }

  @Del("/widgets/batch")
  async batchDeleteWidget(@Query(ALL) params: { ids: string }) {
    try {
      const { ids } = params;
      return await this.widgetService.batchDeleteWidget(ids?.split(","));
    } catch (error) {
      this.ctx?.throw(500, error);
    }
  }

  @Get("/widgets/:id/data")
  async getWidgetSqlData(
    @Param() id: string,
    @Query(ALL)
    {
      queryId,
      time_range,
      time_grain,
    }: {
      queryId?: string;
      /** 全局时间 */
      time_range?: string;
      time_grain?: "1m" | "5m" | "1h";
    }
  ) {
    try {
      let widgetSpec = await this.widgetService.getWidgetSpecification(id);
      widgetSpec = {
        ...widgetSpec,
        ...(() => {
          if (time_range) {
            return {
              time_range: (JSON.parse(time_range) || {}) as ITimeRange,
            };
          }
          return {};
        })(),
        ...(() => {
          if (time_grain) {
            return {
              time_grain: time_grain,
            };
          }
          return {};
        })(),
      };

      const {
        reference = [],
        datasource,
        time_field,
        time_range: timeRange,
        exist_rollup,
        database
      } = widgetSpec;

      const DBType = this.ctx.app.externalSystemClient[database]?.type
      // 转成 sql 语句
      const { sql, colNames, colIdList } = generateSql(
        widgetSpec,
        DBType
      );


      // 标识查询 ID，用于取消查询
      const securityQueryId = queryId ? `/*${base64Encode(queryId)}*/ ` : "";

      const references = [];
      if (reference?.length > 0) {
        const timeDiff = getTimeDiff(
          time_range
            ? ((JSON.parse(time_range) || {}) as ITimeRange)
            : timeRange
        );
        for (let r of reference) {
          if (r.expression_type === ESelectType.PERCENTAGE) {
            references.push(r);
            continue;
          }
          const { denominator } = r;
          const refSpecification = generateReferenceSpecification({
            datasource,
            reference: r,
            time_field,
            time_grain,
            time_range: time_range
              ? ((JSON.parse(time_range) || {}) as ITimeRange)
              : timeRange,
            exist_rollup,
          });

          // 生成sql
          const { sql: refSql } = generateSql(
            refSpecification as any,
            DBType
          );
          const sqlData = await this.databaseService.executeSql(
            refSql + securityQueryId
            , database);
          if (denominator) {
            references.push({
              id: r?.id,
              name: r?.display_name,
              color: r?.color,
              value:
                parseFloat(sqlData[0][Object.keys(sqlData[0])[0]]) / timeDiff,
            });
          } else {
            references.push({
              id: r?.id,
              name: r?.display_name,
              color: r?.color,
              value: parseFloat(sqlData[0][Object.keys(sqlData[0])[0]]),
            });
          }
        }
      }

      const fullSql = sql + securityQueryId;
      const sqlData = await this.databaseService.executeSql(
        fullSql
        , database);
      return {
        sql,
        colNames,
        colIdList,
        formData: widgetSpec,
        data: sqlData,
        references,
      };
    } catch (error) {
      this.ctx?.throw(error);
    }
  }
}
