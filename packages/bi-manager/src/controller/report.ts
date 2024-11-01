import { EReportJobTriggerType } from "@bi/common";
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
import { Context } from "egg";
import { CreateReportInput, QueryReportInput } from "../dto/report.dto";
import { ReportService } from "../service/report";
import { ReportScheduleService } from "../service/reportSchedule";
import { encrypt } from "../utils/encrypt";
import { ELogOperareTarget, ELogOperareType } from "../service/systemLog";

@Provide()
@Controller("/web-api/v1")
export class ReportAPIController {
  @Inject()
  ctx: Context;

  @Inject()
  reportService: ReportService;

  @Inject()
  reportScheduleService: ReportScheduleService;

  @Get("/reports")
  async listReports(@Query(ALL) params: QueryReportInput) {
    const { pageNumber = 0, pageSize = 10, name = "" } = params;
    return await this.reportService.listReports(pageNumber, pageSize, name);
  }

  @Get("/reports/as-list")
  async listAllReports() {
    return await this.reportService.listAllReports();
  }

  @Get("/reports/:id")
  async getReportById(@Param() id: string) {
    const report = await this.reportService.getReportById(id);
    return report ?? {};
  }

  @Post("/reports")
  @Validate()
  async createReport(@Body(ALL) createParam: CreateReportInput) {
    const res = await this.reportService.createReport({
      ...createParam,
      sender_options: encrypt(createParam?.sender_options),
    });
    if (this.ctx.sysLogger && typeof this.ctx.sysLogger === "function") {
      this.ctx.sysLogger({
        content: `报表名称: ${createParam.name}`,
        type: ELogOperareType.CREATE,
        target: ELogOperareTarget.REPORT,
      });
    }
    return res;
  }

  @Put("/reports/:id")
  @Validate()
  async updateReport(
    @Param() id: string,
    @Body(ALL) updateParam: CreateReportInput
  ) {
    const res = await this.reportService.updateReport({
      ...updateParam,
      id,
      sender_options: encrypt(updateParam?.sender_options),
    });
    if (this.ctx.sysLogger && typeof this.ctx.sysLogger === "function") {
      this.ctx.sysLogger({
        content: `报表名称: ${updateParam.name}`,
        type: ELogOperareType.UPDATE,
        target: ELogOperareTarget.REPORT,
      });
    }
    return res;
  }

  @Del("/reports/:id")
  async deleteReport(@Param() id: string) {
    return await this.reportService.deleteReport(id);
  }

  @Post("/reports/:id/run")
  @Validate()
  async runReportJob(@Param() id: string) {
    this.reportScheduleService.tiggerJob(id, EReportJobTriggerType.Once, false);
    const report = await this.reportService.getReportById(id);
    if (this.ctx.sysLogger && typeof this.ctx.sysLogger === "function") {
      this.ctx.sysLogger({
        content: `执行报表名称: ${report.name}`,
        type: ELogOperareType.MANUAL_TASK,
        target: ELogOperareTarget.REPORT,
      });
    }
    return "success";
  }
}
