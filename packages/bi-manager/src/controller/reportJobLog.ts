import {
  ALL,
  Body,
  Config,
  Controller,
  Get,
  Inject,
  Param,
  Post,
  Provide,
  Put,
  Query,
  Validate,
} from "@midwayjs/decorator";
import { Context } from "egg";
import * as fs from "fs";
import * as path from "path";
import { PaginationInput } from "../dto/common.dto";
import { CreateReportJobLogInput } from "../dto/reportJobLog.dto";
import { IMyAppConfig } from "../interface";
import { KEEP_RESPONSE_RAW } from "../middleware/responseHandler";
import { ReportJobLogService } from "../service/reportJobLog";
import { UpdateReportJobLogInput } from "./../dto/reportJobLog.dto";

@Provide()
@Controller("/web-api/v1")
export class ReportJobLogAPIController {
  @Inject()
  ctx: Context;

  @Inject()
  reportJobLogService: ReportJobLogService;

  @Config("report")
  repotConfig: IMyAppConfig["report"];

  @Get("/reports/:reportId/job-logs")
  @Validate()
  async getReportJobLogs(
    @Param() reportId: string,
    @Query(ALL) params: PaginationInput
  ) {
    const { pageNumber = 0, pageSize = 10 } = params;
    const logs = await this.reportJobLogService.listReportJobLogs(
      pageNumber,
      pageSize,
      reportId
    );
    return logs ?? {};
  }

  @Post("/reports/:reportId/job-logs")
  @Validate()
  async createReport(@Body(ALL) createParam: CreateReportJobLogInput) {
    return await this.reportJobLogService.createReportJobLog(createParam);
  }

  @Put("/reports/:reportId/job-logs/:logId")
  @Validate()
  async updateReport(
    @Param() logId: string,
    @Body(ALL) updateParam: UpdateReportJobLogInput
  ) {
    return await this.reportJobLogService.updateReportJobLog({
      ...updateParam,
      id: logId,
    });
  }

  @Get("/reports/:reportId/job-logs/:logId/file-download")
  async downloadReportJobFile(@Param() logId: string) {
    const log = await this.reportJobLogService.getReportJobLogById(logId);

    // zip 文件路径
    const zipPath = path.resolve(this.repotConfig.pdf_dir, `${log.id}.zip`);
    // 判断文件在不在
    if (!fs.existsSync(zipPath)) {
      this.ctx?.throw(404, "文件不存在或已被删除");
    }

    this.ctx.set(KEEP_RESPONSE_RAW, "1");
    this.ctx.set("Content-Disposition", `attachment; filename=${encodeURIComponent(`${log.id}.zip`)}`);
    this.ctx.set("Content-Type", "application/zip");
    this.ctx.body = fs.createReadStream(zipPath);
    this.ctx.status = 200;
  }
}
