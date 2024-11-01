import {
  EReportJobExecutionResult,
  EReportJobStatus,
  EReportJobTriggerType,
  IPageFactory,
} from "@bi/common";
import { Inject, Provide } from "@midwayjs/decorator";
import { Context } from "egg";
import {
  CreateReportJobLogInput,
  UpdateReportJobLogInput,
} from "../dto/reportJobLog.dto";
import ReportJobLogModel from "../model/reportJobLog";
import { getPagination } from "../utils";

@Provide()
export class ReportJobLogService {
  @Inject()
  ctx: Context;

  async listReportJobLogs(
    pageNumber: number,
    pageSize: number,
    reportId?: string
  ): Promise<IPageFactory<ReportJobLogModel>> {
    const paging = getPagination(pageNumber, pageSize);

    const { rows, count } = await ReportJobLogModel.findAndCountAll({
      ...paging,
      where: reportId ? { report_id: reportId } : undefined,
      order: [["created_at", "DESC"]],
    });

    return {
      rows,
      total: count,
      ...paging,
    };
  }

  async getReportJobLogById(id: string): Promise<ReportJobLogModel> {
    const jobLog = await ReportJobLogModel.findByPk(id);
    if (!jobLog) {
      this.ctx?.throw(404, "Report job log not found");
    }
    return jobLog;
  }

  async createReportJobLog(
    reportJobLogData: CreateReportJobLogInput
  ): Promise<ReportJobLogModel> {
    //@ts-ignore
    return await ReportJobLogModel.create(reportJobLogData);
  }

  async updateReportJobLog({ id, ...updates }: UpdateReportJobLogInput) {
    // 更新
    const oldReportJobLog = await this.getReportJobLogById(id);
    return await oldReportJobLog.update(updates);
  }

  // =========封装一层========
  /**
   * 初始化日志
   * @param reportId report ID
   * @param triggerType 触发方式
   * @returns
   */
  async initJobLog(reportId: string, triggerType: EReportJobTriggerType) {
    const jobLog = new CreateReportJobLogInput();
    jobLog.report_id = reportId;
    jobLog.trigger_type = triggerType;
    jobLog.status = EReportJobStatus.Running;

    return await this.createReportJobLog(jobLog);
  }

  /**
   * 日志结束
   * @param logId 日志 ID
   * @param updateParams 更新内容
   * @returns
   */
  async finishedJobLog(
    logId: string,
    updateParams: {
      executionResult: EReportJobExecutionResult;
      executionLog?: string;
      executionFile?: string;
    }
  ) {
    const updateData: Record<string, any> = {
      status: EReportJobStatus.Finished,
      execution_result: updateParams.executionResult,
    };

    if (updateParams.executionLog) {
      updateData.execution_log = updateParams.executionLog;
    }
    if (updateParams.executionFile) {
      updateData.execution_file = updateParams.executionFile;
    }

    return await ReportJobLogModel.update(updateData, {
      where: {
        id: logId,
      },
    });
  }
}
