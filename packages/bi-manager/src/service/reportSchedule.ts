import {
  EReportJobTriggerType,
  EReportSenderType,
  IEmailSenderOptions,
  parseObjJson,
  SHARE_PAGE_PREFIX,
  EReportJobExecutionResult,
  ECronType,
  ITimeRange,
  utcToTimeStamp,
  getRelativeTime,
  ISnapShotSenderOptions,
  EAttachmentSource,
  EAttachmentType,
  getMatchedInterval,
  timeRangeEmpty,
} from "@bi/common";
import { Config, Inject, Logger, Provide } from "@midwayjs/decorator";
import { IMidwayLogger } from "@midwayjs/logger";
import { RedisService } from "@midwayjs/redis";
import { Context } from "egg";
import * as fs from "fs";
import * as schedule from "node-schedule";
import * as path from "path";
import { v4 as uuidv4 } from "uuid";
import { IMyAppConfig, IReportJobFile, IReportScheduleMap } from "../interface";
import { Utils } from "../utils";
// import { html2pdf } from "../utils/puppeteer";
import { toZip } from "./../utils/zip";
import { DashboardService } from "./dashboard";
import { JwtService } from "./jwt";
import { ReportService } from "./report";
import { ReportJobLogService } from "./reportJobLog";
import { WidgetService } from "./widget";
import { Readable } from "typeorm/platform/PlatformTools";
import { HttpService } from "@midwayjs/axios";
import { decrypt } from "../utils/encrypt";
import {
  ELogOperareTarget,
  ELogOperareType,
  SystemLogService,
} from "./systemLog";
import { SMTPService } from "./smtp";

export const PDF_OUT_DIR = "/opt/components/bi-apps/app/dist/resources/pdf";
// 执行任务的前缀
const SCHEDULE_JOB_PREFIX = "report_schedule_job:";

@Provide()
export class ReportScheduleService {
  @Inject()
  ctx: Context;

  @Inject()
  reportService: ReportService;

  @Inject()
  redisService: RedisService;

  @Inject()
  dashboardService: DashboardService;

  @Inject()
  widgetService: WidgetService;

  @Inject()
  smtpService: SMTPService;

  @Inject()
  jwtService: JwtService;

  @Inject()
  reportJobLogService: ReportJobLogService;

  @Logger()
  readonly logger: IMidwayLogger;

  @Inject()
  utils: Utils;

  @Config("report")
  repotConfig: IMyAppConfig["report"];

  @Config("web_uri")
  webUri: string;

  @Inject()
  httpService: HttpService;

  @Inject()
  systemLogService: SystemLogService;

  /**
   * 生成 Job
   * @param reportId 定时报表ID
   */
  async generateReportScheduleJob(reportId: string) {
    const jobId = uuidv4();
    // 查询 report 的信息
    const report = await this.reportService.getReportById(reportId);
    if (!report) {
      this.logger.error(
        `[report-schedule] Job create error, because report not found: ${reportId}`
      );
      return;
    }

    const job = schedule.scheduleJob(
      jobId,
      // @see https://github.com/node-schedule/node-schedule/issues/217
      report.cron_type === ECronType.Once
        ? new Date(report.exec_time)
        : {
            rule: report.cron,
            tz: report.timezone,
          },
      async () => {
        this.tiggerJob(report.id, EReportJobTriggerType.Cron, true);
      }
    );

    // 本地记录 job
    this.utils.scheduleJobMap.set(reportId, job);
    // 更新 redis
    await this.redisService.set(
      `${SCHEDULE_JOB_PREFIX}${jobId}`,
      `${reportId}-${Date.now()}`
    );
  }

  /**
   * 获取所有的执行任务
   * @returns
   */
  async listAllJobs() {
    let jobsMap = await this.utils.scheduleJobMap;
    return jobsMap ?? <IReportScheduleMap>{};
  }

  /**
   * 清空所有的执行任务
   * @param reportId 定时报表ID
   */
  async clearAllScheduleJobs() {
    await this.utils.scheduleJobMap.clear();
  }

  /**
   * 新增报表的执行任务
   * @param reportId 定时报表ID
   */
  async createJob(reportId: string) {
    await this.generateReportScheduleJob(reportId);
  }

  /**
   * 更新报表的执行任务
   * @param reportId 定时报表ID
   */
  async updateJob(reportId: string) {
    await this._cancelJob(reportId);
    await this.generateReportScheduleJob(reportId);
  }

  /**
   * 删除报表的执行任务
   * @param reportId 定时报表ID
   */
  async deleteJob(reportId: string) {
    await this._cancelJob(reportId);
  }

  /**
   * 触发任务
   * @param reportId 报表 ID
   * @param triggerType 触发方式
   * @param neddLocked 是否需要加锁
   * @returns
   */
  async tiggerJob(
    reportId: string,
    triggerType: EReportJobTriggerType,
    neddLocked: boolean = false
  ) {
    const report = await this.reportService.getReportById(reportId);
    if (!report) {
      return;
    }

    if (neddLocked) {
      // 加锁，保证每个 job 只能有一个 worker 执行
      const locked = await this.utils.redisRedlock.lock(
        "reportScheduleJob:" + reportId,
        "reportScheduleJob",
        180
      );

      if (!locked) {
        return false;
      }
    }

    let jobLogId = "";
    try {
      // 初始化任务日志
      const jobLog = await this.reportJobLogService.initJobLog(
        report.id,
        triggerType
      );
      jobLogId = jobLog.id;
      // 执行任务
      await this.executeJob(reportId, jobLogId);
      // 日志记录完成
      await this.reportJobLogService.finishedJobLog(jobLogId, {
        executionResult: EReportJobExecutionResult.Success,
        executionLog: "执行完成",
      });
      this.logger.info("执行任务`%s`成功", report.name);
    } catch (error) {
      // 记录失败任务日志
      this.logger.info("执行任务`%s`失败", error);
      await this.reportJobLogService.finishedJobLog(jobLogId, {
        executionResult: EReportJobExecutionResult.Failure,
        executionLog: error.message,
      });
    } finally {
      if (neddLocked) {
        // 释放锁
        await this.utils.redisRedlock.unlock("reportScheduleJob:" + reportId);
      }
    }
  }

  /**
   * 生成PDF
   * @param jobLogId 执行计划日志 ID
   * @param attachmentType 附件类型
   * @param attachmentSource 附件来源 仪表盘｜图表
   * @param attachmentList 附件信息
   * @param timeRange 可选，时间范围
   * @param jwtToken JWTTOKEN
   */
  async generatePdf({
    jobLogId,
    attachmentSource,
    attachmentList,
    timeRange,
    jwtToken,
    timeout,
  }: {
    jobLogId: string;
    attachmentSource: EAttachmentSource;
    attachmentList: {
      id: string;
      name: string;
    }[];
    timeRange?: ITimeRange;
    jwtToken: string;
    timeout?: number;
  }): Promise<[string, Buffer]> {
    // 生成 pdf
    const pages = attachmentList.map(({ id, name }) => {
      /** 计算时间范围 */
      const rangeStr = (() => {
        if (
          timeRange?.type === "custom" &&
          timeRange?.custom &&
          timeRange?.custom.length == 2
        ) {
          return `&from=${utcToTimeStamp(
            timeRange?.custom[0]
          )}&to=${utcToTimeStamp(timeRange?.custom[1])}`;
        } else if (timeRange?.type === "range") {
          const currentTime = new Date().valueOf();
          const relativeTime = getRelativeTime(
            timeRange?.range,
            timeRange?.unit as any,
            currentTime
          );
          return `&from=${relativeTime}&to=${currentTime}`;
        }
        return "";
      })();
      return {
        url: `/bi${SHARE_PAGE_PREFIX}/${
          attachmentSource === EAttachmentSource.DASHBOARD
            ? "dashboard"
            : "widget"
        }/${id}/preview?token=${jwtToken}${rangeStr}${
          timeRange?.include_lower
            ? `&include_lower=${timeRange?.include_lower}`
            : ""
        }${
          timeRange?.include_upper
            ? `&include_upper=${timeRange?.include_upper}`
            : ""
        }`,
        filename: `${name}`,
      };
    });
    const result = await this.httpService.get<{
      showDir: string;
      shotPngList: string[];
    }>("http://127.0.0.1:10086/shot-page", {
      params: {
        shotParams: JSON.stringify({
          server: "127.0.0.1",
          shotDir: PDF_OUT_DIR,
          shotMode: "bi",
          ...(() => {
            if (timeout) {
              return {
                biTimeout: timeout,
              };
            }
            return {};
          })(),
          shotList: pages.map((page) => ({
            name: page.filename,
            path: page.url,
          })),
        }),
      },
    });

    const { shotPngList } = result.data as any;

    let resultFileName = `${jobLogId}.zip`;
    let resultFileBuffer: Buffer | undefined = undefined;
    if (shotPngList.length > 0) {
      const pdfs = [];
      for (const fileName of shotPngList) {
        pdfs.push({
          fileContent: fs.readFileSync(
            `${path.join(this.repotConfig.pdf_dir, fileName)}`
          ),
          filename: fileName,
        });
      }

      // 多个 pdf 打包成一个 zip
      resultFileBuffer = await toZip(pdfs);
      // 文件落盘
      fs.writeFileSync(
        `${path.join(this.repotConfig.pdf_dir, resultFileName)}`,
        resultFileBuffer
      );
    }
    return [resultFileName, resultFileBuffer];
  }

  /**
   * 生成PDF
   * @param jobLogId 执行计划日志 ID
   * @param attachmentType 附件类型 csv | excel
   * @param attachmentList 附件信息
   * @param timeRange 可选，时间范围
   * @param jwtToken JWTTOKEN
   */
  async generateCsvExcel({
    jobLogId,
    attachmentType,
    attachmentList,
    timeRange,
  }: {
    jobLogId: string;
    attachmentType: Exclude<`${EAttachmentType}`, `${EAttachmentType.PDF}`>;
    attachmentList: {
      id: string;
      name: string;
    }[];
    timeRange?: ITimeRange;
  }): Promise<[string, Buffer]> {
    let resultFileName = `${jobLogId}.zip`;
    let resultFileBuffer: Buffer | undefined = undefined;
    const streamList: IReportJobFile[] = [];
    for (const attachment of attachmentList) {
      const { id } = attachment;
      const [name, file] = await this.widgetService.exportWidgetTable(
        id,
        attachmentType,
        !timeRangeEmpty(timeRange) ? JSON.stringify(timeRange) : undefined,
        !timeRangeEmpty(timeRange)
          ? getMatchedInterval(timeRange?.custom[0]!, timeRange?.custom[1]!)
          : undefined
      );
      if (attachmentType === EAttachmentType.CSV) {
        const stream = Readable.from(file);
        streamList.push({
          fileContent: stream.read(),
          filename: `${name}.csv`,
        });
      } else if (attachmentType === EAttachmentType.EXCEL) {
        const stream = Readable.from(file);
        streamList.push({
          fileContent: stream.read(),
          filename: `${name}.xlsx`,
        });
      }
    }
    if (streamList.length > 0) {
      // 多个 pdf 打包成一个 zip
      resultFileBuffer = await toZip(streamList, true);
      // 文件落盘
      fs.writeFileSync(
        `${path.join(this.repotConfig.pdf_dir, resultFileName)}`,
        resultFileBuffer
      );
    }
    return [resultFileName, resultFileBuffer];
  }

  /**
   * 执行任务
   * @param reportId 定时报表 ID
   * @param jobLogId 执行计划日志 ID
   * @returns
   */
  async executeJob(reportId: string, jobLogId: string) {
    const report = await this.reportService.getReportById(reportId);
    const {
      global_time_range,
      // sender_type,
      sender_options,
      dashboard_ids: oldDashboardIds,
    } = report || {};
    // 生成 jwt token
    const jwtToken = ''
    const timeRange = parseObjJson<ITimeRange>(global_time_range);

    const { attachment, timeout } = decrypt(sender_options || "{}") as
      | IEmailSenderOptions
      | ISnapShotSenderOptions;

    const { attachment_source, attachment_type, dashboard_ids, widget_ids } =
      attachment || {
        attachment_source: EAttachmentSource.DASHBOARD,
        attachment_type: EAttachmentType.PDF,
        dashboard_ids: oldDashboardIds,
      };

    const attachmentNameMap = await (async () => {
      if (attachment_source === EAttachmentSource.DASHBOARD) {
        const dashboards =
          (await this.dashboardService.listAllDashboards()) || [];
        return dashboards.reduce((prev, curr) => {
          return {
            ...prev,
            [curr.id]: curr.name,
          };
        }, {});
      } else if (attachment_source === EAttachmentSource.WIDGET) {
        const widgets = (await this.widgetService.listAllWidgets()) || [];
        return widgets.reduce((prev, curr) => {
          return {
            ...prev,
            [curr.id]: curr.name,
          };
        }, {});
      } else {
        return {};
      }
    })();

    const attachmentList = (
      attachment_source === EAttachmentSource.DASHBOARD
        ? dashboard_ids
        : widget_ids
    ).map((id) => {
      return {
        id,
        name: attachmentNameMap[id],
      };
    });

    let resultFileName: string, resultFileBuffer: string | Buffer;

    if (attachment_type === EAttachmentType.PDF) {
      [resultFileName, resultFileBuffer] = await this.generatePdf({
        jobLogId,
        attachmentSource: attachment_source,
        attachmentList,
        timeRange,
        jwtToken,
        timeout,
      });
    } else if (
      attachment_type === EAttachmentType.CSV ||
      attachment_type === EAttachmentType.EXCEL
    ) {
      [resultFileName, resultFileBuffer] = await this.generateCsvExcel({
        jobLogId,
        attachmentType: attachment_type,
        attachmentList,
        timeRange,
      });
    }
    // 外发邮件类型
    if (report.sender_type === EReportSenderType.Email) {
      let {
        receiver_emails = [],
        subject = undefined,
        content = undefined,
      } = decrypt(report.sender_options || "{}");
      (() => {
        const [startTime, endTime] = timeRange?.custom || [];
        if (startTime && endTime) {
          subject = subject
            ?.replace("@startTime", startTime)
            ?.replace("@endTime", endTime);
          content = content
            ?.replace("@startTime", startTime)
            ?.replace("@endTime", endTime);
        }
      })();
      // 发送邮件
      await this.smtpService.sendMail(
        receiver_emails,
        subject || report.name,
        content,
        [
          {
            filename: resultFileName,
            content: resultFileBuffer,
          },
        ]
      );
    }

    this.systemLogService.write({
      content: `定时报表: ${report.name as any}, 执行时间: ${new Date()}`,
      type: ELogOperareType.TIMER_TASK,
      target: ELogOperareTarget.REPORT,
    });

    this.logger.info("[report-schedule] run report {%s} job success", reportId);
  }

  /**
   *
   * @param reportId 报表 ID
   */
  private async _cancelJob(reportId: string) {
    this.logger.info("[report-schedule] cancel job of report {%s}", reportId);
    // 停止 job
    const job = this.utils.scheduleJobMap.get(reportId);
    if (job) {
      job.cancel();
      // 删除 redis
      await this.redisService.del(`${SCHEDULE_JOB_PREFIX}${job.name}`);
    }
    // 删除本地缓存
    this.utils.scheduleJobMap.delete(reportId);
  }
}
