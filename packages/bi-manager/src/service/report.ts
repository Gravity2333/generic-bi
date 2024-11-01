import { IPageFactory } from "@bi/common";
import { Inject, Provide } from "@midwayjs/decorator";
import { Context } from "egg";
import { Op } from "sequelize";
import { CreateReportInput, UpdateReportInput } from "../dto/report.dto";
import ReportModel from "../model/report";
import { getPagination } from "../utils";
import { ReportScheduleService } from "./reportSchedule";
import { decrypt } from "../utils/encrypt";
import { ELogOperareTarget, ELogOperareType } from "./systemLog";

@Provide()
export class ReportService {
  @Inject()
  ctx: Context;

  @Inject()
  reportScheduleService: ReportScheduleService;

  async listReports(
    pageNumber: number,
    pageSize: number,
    name?: string
  ): Promise<IPageFactory<ReportModel>> {
    const paging = getPagination(pageNumber, pageSize);

    const { rows, count } = await ReportModel.findAndCountAll({
      ...paging,
      where: name ? { name: { [Op.like]: `%${name}%` } } : undefined,
      order: [["created_at", "DESC"]],
    });

    rows.forEach((row) => {
      row.sender_options = JSON.stringify(decrypt(row.sender_options));
    });

    return {
      rows,
      total: count,
      ...paging,
    };
  }

  async listAllReports(): Promise<ReportModel[]> {
    const { rows } = await ReportModel.findAndCountAll({
      order: [["created_at", "DESC"]],
    });
    rows.forEach((row) => {
      row.sender_options = JSON.stringify(decrypt(row.sender_options));
    });
    return rows;
  }

  async getReportById(id: string): Promise<ReportModel> {
    const report = await ReportModel.findByPk(id);
    if (!report) {
      this.ctx?.throw(404, "Report not found");
    }
    report.sender_options = JSON.stringify(decrypt(report.sender_options));
    return report;
  }

  async createReport(reportFormData: CreateReportInput): Promise<ReportModel> {
    // 创建定时报表
    //@ts-ignore
    const report = await ReportModel.create(reportFormData);
    // 创建执行计划
    await this.reportScheduleService.createJob(report.id);
    return report;
  }

  async updateReport({ id, ...updates }: UpdateReportInput) {
    // 更新
    const oldReport = await this.getReportById(id);
    const newReport = await oldReport.update(updates);
    // 刷新执行计划
    await this.reportScheduleService.updateJob(newReport.id);

    return newReport;
  }

  /** 查询是否有包含指定 Dashboard 的 Report */
  async getReportByDashboardId(dashboardId: string) {
    return await ReportModel.findOne({
      where: {
        dashboard_ids: {
          [Op.contains]: [dashboardId],
        },
      },
    });
  }

  async deleteReport(id: string) {
    const report = await this.getReportById(id);
    // 删除
    await report.destroy();
    // 删除执行计划
    await this.reportScheduleService.deleteJob(report.id);
    if (this.ctx.sysLogger && typeof this.ctx.sysLogger === "function") {
      this.ctx.sysLogger({
        content: `报表名称: ${report.name}`,
        type: ELogOperareType.DELETE,
        target: ELogOperareTarget.REPORT,
      });
    }
    return report;
  }
}
