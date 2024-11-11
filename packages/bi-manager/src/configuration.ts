import { ILifeCycle, IMidwayContainer } from "@midwayjs/core";
import { App, Configuration, Inject, Logger } from "@midwayjs/decorator";
import { IMidwayLogger } from "@midwayjs/logger";
import { Application } from "@midwayjs/web";
import { join } from "path";
import { ApiController } from "./controller/api";
import { DashboardService } from "./service/dashboard";
import { NpmdDictMappingService } from "./service/npmdDictMapping";
import { ReportService } from "./service/report";
import { ReportScheduleService } from "./service/reportSchedule";
import { Utils } from "./utils";
import { WidgetService } from "./service/widget";
import { NpmdDictService } from "./service/dicts";
import { DatabaseService } from "./service/database";
import { OsService } from "./service/os";
@Configuration({
  imports: [
    "@midwayjs/sequelize",
    "@midwayjs/orm",
    "@midwayjs/view-ejs",
    "@midwayjs/redis",
    "@midwayjs/jwt",
    "@midwayjs/axios",
  ],
  // @see https://midwayjs.org/docs/env_config#%E4%B8%9A%E5%8A%A1%E9%85%8D%E7%BD%AE%E5%8A%A0%E8%BD%BD
  importConfigs: [join(__dirname, "./config/")],
})
export class ContainerConfiguration implements ILifeCycle {
  @App()
  app: Application;

  @Logger()
  readonly logger: IMidwayLogger;

  @Inject()
  reportService: ReportService;

  @Inject()
  dashboardService: DashboardService;

  @Inject()
  osService: OsService;

  @Inject()
  npmdDictMappingService: NpmdDictMappingService;

  @Inject()
  npmdDictService: NpmdDictService;

  @Inject()
  widgetService: WidgetService;

  @Inject()
  api: ApiController;

  @Inject()
  utils: Utils;

  @Inject()
  reportScheduleService: ReportScheduleService;

  @Inject()
  databaseService: DatabaseService;
  /**
   * 在应用配置加载后执行
   */
  async onConfigLoad(container: IMidwayContainer) {}

  /**
   * 在应用 ready 的时候执行
   * @param container IoC 容器
   * @param app 应用 app
   */
  async onReady(container: IMidwayContainer) {
    // 初始化定时报表执行任务
    // =======================
    this.logger.info("[report-schedule] init jobs start...");
    /** bi自检,纠错 */
    this.databaseService.initDatabaseInstance();
    /** 检查图表数据源 */
    this.widgetService.checkWidgetSource();
    /** 初始化默认仪表盘 */
    this.dashboardService.initDefaultDashboard();
    /** 初始化默认图表 */
    this.widgetService.initDefaultWidget();
    /** 初始化字典映射 */
    this.npmdDictMappingService.initDictMapping();
    /** 设置默认数据库 */
    this.databaseService.initDefaultDatabse();
    /** 定时查询系统信息 */
    this.osService.runSysInfoTask();

    // 查询定时报表
    const reportList = await this.reportService.listAllReports();
    setTimeout(() => {
      // 循环注册job
      reportList.forEach(async (report) => {
        await this.reportScheduleService.generateReportScheduleJob(report.id);
      });
      this.app.logger.info(
        `[report-schedule] init jobs finished, jobs number: ${reportList.length}...`
      );
    }, 2000);

    process.on("uncaughtException", function (err) {
      //打印出错误
      console.log(err);
      //打印出错误的调用栈方便调试
      console.log(err.stack);
    });
  }

  /**
   * 在应用停止的时候执行
   * @param container IoC 容器
   * @param app 应用 app
   */
  async onStop() {
    await this.app.logger.info("[report-schedule] clear jobs start...");
    const scheduleJobMap = this.utils.scheduleJobMap;
    [...scheduleJobMap.keys()].forEach(async (reportId) => {
      await this.reportScheduleService.deleteJob(reportId);
    });
    await this.app.logger.info(
      "[report-schedule] clear jobs finished, jobs number: %d..."
    );
  }
}
