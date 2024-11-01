import { SHARE_PAGE_PREFIX } from "@bi/common";
import {
  ALL,
  Body,
  Config,
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
import { IMidwayLogger } from "@midwayjs/logger";
import { Context } from "egg";
import { ValidationError } from "joi";
import { Readable } from "stream";
import {
  CreateDashboardInput,
  QueryDashboardInput,
} from "../dto/dashboard.dto";
import { IMyAppConfig, IReportJobFile } from "../interface";
import { KEEP_RESPONSE_RAW } from "../middleware/responseHandler";
import { DashboardService } from "../service/dashboard";
import { JwtService } from "../service/jwt";
import { Utils } from "../utils";
import * as fs from "fs";
import { WidgetService } from "../service/widget";
import { v4 as uuidv4 } from "uuid";
import path = require("path");
import { HttpService } from "@midwayjs/axios";
import { PDF_OUT_DIR } from "../service/reportSchedule";
import { ELogOperareTarget, ELogOperareType } from "../service/systemLog";
const formidable = require("formidable");

@Provide()
@Controller("/web-api/v1")
export class DashboardAPIController {
  @Inject()
  ctx: Context;

  @Inject()
  dashboardService: DashboardService;

  @Inject()
  widgetService: WidgetService;

  @Inject()
  jwtService: JwtService;

  @Config("web_uri")
  webUri: string;

  @Inject()
  utils: Utils;

  @Config(ALL)
  config: IMyAppConfig;

  @Logger()
  readonly logger: IMidwayLogger;

  @Inject()
  httpService: HttpService;

  @Config("report")
  repotConfig: IMyAppConfig["report"];

  @Get("/dashboards")
  @Validate()
  async listDashboards(@Query(ALL) params: QueryDashboardInput) {
    const { pageNumber = 0, pageSize = 10, name = "" } = params;
    return await this.dashboardService.listDashboards(
      pageNumber,
      pageSize,
      name
    );
  }

  @Get("/dashboards/as-list")
  @Validate()
  async listAllDashboards(@Query(ALL) params: QueryDashboardInput) {
    const { name = "" } = params;
    return await this.dashboardService.listAllDashboards(name);
  }

  @Get("/dashboards/:id")
  async getDashboardById(@Param() id: string) {
    const dashboard = await this.dashboardService.getDashboardById(id);
    return dashboard ?? {};
  }

  @Post("/dashboards")
  @Validate()
  async createDashboard(@Body(ALL) createParam: CreateDashboardInput) {
    try {
      const param = await this.dashboardService.createDashboard(createParam);
      const id = param?.getDataValue("id");
      const ids = await this.utils.dashbroadSeqService.get();
      const idList = (ids?.split(",") || [])?.filter((f) => f);
      idList.push(id);
      this.utils.dashbroadSeqService.set(idList.join(","));
      /** 写日志 */
      if (this.ctx.sysLogger && typeof this.ctx.sysLogger === "function") {
        this.ctx.sysLogger({
          content: `仪表盘名称: ${createParam.name}`,
          type: ELogOperareType.CREATE,
          target: ELogOperareTarget.DASHBOARD,
        });
      }
      return param;
    } catch (error) {
      if (error instanceof ValidationError) {
        this.ctx?.throw(500, "Params Validation Error");
      } else {
        this.ctx?.throw(500, error);
      }
    }
  }

  /** 上传系统仪表盘 */
  @Post("/dashboards/system/as-import")
  @Validate()
  async importSystemDashboard() {
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
        throw new Error(info);
      } else {
        /** 目标文件夹路径 */
        const defaultDashboardDirPath = this.config?.init?.dashboard;
        fs.writeFileSync(`${defaultDashboardDirPath}/index.bi`, info);
        /** 插入数据 */
        this.dashboardService.initDefaultDashboard();
      }
    } catch (error) {
      this.logger.error("[import error]", error);
      this.ctx?.throw(500, error);
    }
  }

  /** 上传默认仪表盘 */
  @Post("/dashboards/default/as-import")
  @Validate()
  async importDefaultDashboard() {
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
        throw new Error(info);
      } else {
        const id = uuidv4();
        let dinfo = JSON.parse(info);
        dinfo = {
          ...dinfo[0],
          id,
        };
        /** 目标文件夹路径 */
        const defaultDashboardDirPath = this.config?.init?.dashboard;
        fs.writeFileSync(
          `${defaultDashboardDirPath}/${id}.bi`,
          JSON.stringify([dinfo])
        );
        /** 插入数据 */
        this.dashboardService.initDefaultDashboard();
      }
    } catch (error) {
      this.logger.error("[import error]", error);
      this.ctx?.throw(500, error);
    }
  }

  /** 获取默认仪表盘列表 */
  @Get("/dashboards/default/as-list")
  async getDefaultDashboardList() {
    /** 目标文件夹路径 */
    const defaultDashboardDirPath = this.config?.init?.dashboard;
    const infoList = fs
      .readdirSync(defaultDashboardDirPath)
      .filter((name) => name !== ".DS_Store")
      .map((fileName) => {
        const dashboardPath = `${path.join(defaultDashboardDirPath, fileName)}`;
        const info = JSON.parse(fs.readFileSync(dashboardPath, "utf-8"));
        return {
          ...info[0],
          fileName: fileName.split(".")[0],
        };
      });
    return infoList;
  }

  /** 上传仪表盘 */
  @Post("/dashboards/as-import")
  @Validate()
  async importDashboard() {
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
        throw new Error(info);
      } else {
        /** 写日志 */
        const dashboardList = JSON.parse(info) as any[];
        if (this.ctx.sysLogger && typeof this.ctx.sysLogger === "function") {
          this.ctx.sysLogger({
            content: `上传仪表盘名称: [${dashboardList
              .map((d) => d.name)
              .join(",")}]`,
            type: ELogOperareType.IMPORT,
            target: ELogOperareTarget.DASHBOARD,
          });
        }
        /** 插入数据 */
        this.dashboardService.importDashboard(info);
      }
    } catch (error) {
      this.logger.error("[import error]", error);
      this.ctx?.throw(500, error);
    }
  }

  @Put("/dashboards/:id")
  @Validate()
  async updateDashboard(
    @Param() id: string,
    @Body(ALL) updateParam: CreateDashboardInput
  ) {
    try {
      const updateRes = await this.dashboardService.updateDashboard({
        ...updateParam,
        id,
      });
      if (this.ctx.sysLogger && typeof this.ctx.sysLogger === "function") {
        /** 写日志 */
        this.ctx.sysLogger({
          content: `仪表盘名称: ${updateParam.name}`,
          type: ELogOperareType.UPDATE,
          target: ELogOperareTarget.DASHBOARD,
        });
      }
      return updateRes;
    } catch (error) {
      if (error instanceof ValidationError) {
        this.ctx?.throw(500, "Params Validation Error");
      } else {
        this.ctx?.throw(500, error);
      }
    }
  }

  @Del("/dashboards/batch")
  async batchDeleteDashboard(@Query(ALL) params: { ids: string }) {
    try {
      const { ids } = params;
      return await this.dashboardService.batchDeleteDashboard(ids?.split(","));
    } catch (error) {
      this.ctx?.throw(500, error);
    }
  }

  @Del("/dashboards/:id")
  async deleteDashboard(@Param() id: string) {
    return await this.dashboardService.deleteDashboard(id);
  }

  @Del("/dashboards/default/:id")
  async deleteDefaultDashboard(@Param() id: string) {
    /** 目标文件夹路径 */
    const defaultDashboardDirPath = this.config?.init?.dashboard;
    const path = `${defaultDashboardDirPath}/${id}.bi`;
    const dashboardJson = fs.readFileSync(path, "utf-8");
    const { id: dashboardId } = JSON.parse(dashboardJson)[0];
    fs.rmSync(path);
    await this.dashboardService.forceDeleteDashboardIfExist(dashboardId);
  }

  @Get("/dashboards/:id/export")
  async exportDashboardPdf(@Param() id: string) {
    const dashboard = await this.dashboardService.getDashboardById(id);
    const jwtToken = await this.jwtService.generateFixedToken();
    let pdfs: IReportJobFile[] = [];
    try {
      const result = await this.httpService.get<{
        showDir: string;
        shotPngList: string[];
      }>("http://127.0.0.1:10086/shot-page", {
        params: {
          shotParams: JSON.stringify({
            server: "127.0.0.1",
            shotDir: PDF_OUT_DIR,
            shotMode: "bi",
            shotList: [
              {
                name: dashboard.id,
                path: `/bi${SHARE_PAGE_PREFIX}/dashboard/${id}/preview?token=${jwtToken}`,
              },
            ],
          }),
        },
      });
      const { shotPngList } = result.data as any;
      if (shotPngList.length > 0) {
        for (const fileName of shotPngList) {
          pdfs.push({
            fileContent: fs.readFileSync(
              `${path.join(this.repotConfig.pdf_dir, fileName)}`
            ),
            filename: fileName,
          });
        }
      }
    } catch (error) {
      this.logger.error(error);
    }

    if (pdfs.length !== 1) {
      this.ctx?.throw(500, "导出文件异常");
    }

    const stream = Readable.from(pdfs[0].fileContent);

    this.ctx.set(KEEP_RESPONSE_RAW, "1");
    this.ctx.set("Content-Disposition", `attachment; filename=${encodeURIComponent(`${dashboard.name}.pdf`)}`);
    this.ctx.set("Content-Type", "application/pdf");
    this.ctx.body = stream;
    this.ctx.status = 200;
  }

  @Get("/dashboards/as-export")
  @Validate()
  async exportDashboard(
    @Query(ALL) params: { ids: string; exportWidgets: string }
  ) {
    try {
      const { ids, exportWidgets } = params;
      const dashboardLists = await this.dashboardService.getDashboardByIds(
        ids?.split(",")
      );
      let exportResult: any[] = [];
      if (exportWidgets === "1") {
        for (const dashboard of dashboardLists) {
          const rawDashboardData = (dashboard as any)?.dataValues;
          const { widget_ids = [] } = rawDashboardData;
          const rawWidgetsData = (
            (await this.widgetService.getWidgetByIds(widget_ids)) as any
          )?.map((w) => w.dataValues);
          exportResult.push({
            ...rawDashboardData,
            specification: JSON.parse(rawDashboardData.specification),
            widgets: exportWidgets
              ? rawWidgetsData.map((widget) => ({
                  ...widget,
                  name: `${widget?.name}`,
                }))
              : undefined,
          });
        }
      } else {
        exportResult = dashboardLists.map(({ dataValues }: any) => {
          const res = {
            ...dataValues,
            specification: JSON.parse(dataValues.specification),
          };
          return res;
        });
      }
      const stream = Readable.from(JSON.stringify(exportResult));
      this.ctx.set(KEEP_RESPONSE_RAW, "1");
      this.ctx.set("Content-Type", "application/octet-stream");
      this.ctx.set("Content-Disposition", "attachment; filename=dashboards.bi");
      this.ctx.status = 200;
      this.ctx.body = stream;
    } catch (error) {
      this.ctx?.throw(500, error);
    }
  }

  @Post("/dashboards/seq")
  @Validate()
  async setDashboardSeq(@Body(ALL) { ids }: { ids: string }) {
    try {
      await this.utils.dashbroadSeqService.set(ids);
    } catch (error) {
      this.ctx?.throw(500, error);
    }
  }
}
