import {
  EBIVERSION,
  IPageFactory,
  SYSTEM_DASHBOARD_ID,
  SYSTEM_DASHBOARD_NAME,
} from "@bi/common";
import { ALL, Config, Inject, Logger, Provide } from "@midwayjs/decorator";
import { IMidwayLogger } from "@midwayjs/logger";
import { Context } from "egg";
import { Op } from "sequelize";
import {
  CreateDashboardInput,
  UpdateDashboardInput,
} from "../dto/dashboard.dto";
import { IMyAppConfig } from "../interface";
import DashboardModel from "../model/dashboard";
import { getPagination, Utils } from "../utils";
import { ReportService } from "./report";
import { WidgetService } from "./widget";
import * as fs from "fs";
import path = require("path");
import { ELogOperareTarget, ELogOperareType } from "./systemLog";
const isCms = process.env.BI_VERSION === EBIVERSION.CMS;
@Provide()
export class DashboardService {
  @Inject()
  ctx: Context;

  @Inject()
  widgetService: WidgetService;

  @Inject()
  reportService: ReportService;

  @Config(ALL)
  config: IMyAppConfig;

  @Config("init")
  initConfig: IMyAppConfig["init"];

  @Logger()
  readonly logger: IMidwayLogger;

  @Inject()
  utils: Utils;

  /**
   * 分页查询 Dashboard
   * @param pageNumber 页码
   * @param pageSize 每页数量
   * @param name 过滤名称
   * @returns
   */
  async listDashboards(
    pageNumber: number,
    pageSize: number,
    name?: string
  ): Promise<IPageFactory<DashboardModel>> {
    const paging = getPagination(pageNumber, pageSize);

    const { rows, count } = await DashboardModel.findAndCountAll({
      ...paging,
      where: name ? { name: { [Op.like]: `%${name}%` } } : undefined,
      order: [["created_at", "DESC"]],
    });

    return {
      rows,
      total: count,
      ...paging,
    };
  }

  /**
   * 查找所有的Dashboard
   * @param name 过滤名称
   * @returns
   */
  async listAllDashboards(name?: string): Promise<DashboardModel[]> {
    const rows = await DashboardModel.findAll({
      where: name ? { name: { [Op.like]: `%${name}%` } } : undefined,
      order: [["created_at", "DESC"]],
    });
    const ids = await this.utils.dashbroadSeqService.get();
    const idList = (ids?.split(",") || [])?.filter((f) => f);
    const results = idList
      ?.map((id) => {
        const dashboardIndex = rows.findIndex((r) => r?.id === id);
        if (dashboardIndex > -1) {
          const d = rows[dashboardIndex];
          rows.splice(dashboardIndex, 1);
          return d;
        }
        return undefined;
      })
      .filter((f) => f);
    return [...rows, ...results];
  }

  /**
   * 根据 ID 查询多个 Dashboard
   * @param ids ids
   * @returns
   */
  async getDashboardByIds(ids: string[]): Promise<DashboardModel[]> {
    if (ids.length === 0) {
      return [];
    }
    const widgets = await DashboardModel.findAll({
      where: {
        id: { [Op.in]: ids },
      },
    });
    return widgets;
  }

  async getDashboardById(id: string): Promise<DashboardModel> {
    const dashboard = await DashboardModel.findByPk(id);
    if (!dashboard) {
      this.ctx?.throw(404, "Dashboard not found");
    }
    return dashboard;
  }

  /** 查询是否有包含指定 widget 的 Dashboard */
  async getDashboardByWidgetId(widgetId: string) {
    return await DashboardModel.findOne({
      where: {
        widget_ids: {
          [Op.contains]: [widgetId],
        },
      },
    });
  }

  async createDashboard(
    dashboard: CreateDashboardInput
  ): Promise<DashboardModel> {
    //@ts-ignore
    return await DashboardModel.create(dashboard);
  }

  async updateDashboard({ id, ...updates }: UpdateDashboardInput) {
    const target = await this.getDashboardById(id);
    return await target.update(updates);
  }

  async batchDeleteDashboard(ids: string[]) {
    const delNames = [];
    for (let id of ids) {
      const dashboard = await this.getDashboardById(id);
      delNames.push(dashboard.name);
      // 检查 widget 是否已经被应用
      const report = await this.reportService.getReportByDashboardId(
        dashboard.id
      );
      if (report) {
        this.ctx?.throw(500, `已被 Report 【${report?.name}】使用，无法删除`);
      }
      await dashboard.destroy();
    }
    if (this.ctx.sysLogger && typeof this.ctx.sysLogger === "function") {
      /** 写日志 */
      this.ctx.sysLogger({
        content: `仪表盘名称: [${delNames.join(",")}]`,
        type: ELogOperareType.BATCH_DELETE,
        target: ELogOperareTarget.DASHBOARD,
      });
    }
  }

  async deleteDashboard(id: string) {
    const dashboard = await this.getDashboardById(id);
    // 检查 widget 是否已经被应用
    const report = await this.reportService.getReportByDashboardId(
      dashboard.id
    );
    if (report) {
      this.ctx?.throw(500, `已被 Report 【${report?.name}】使用，无法删除`);
    }
    const ids = await this.utils.dashbroadSeqService.get();
    const idList = (ids?.split(",") || [])?.filter((f) => f);
    const index = idList.findIndex((i) => i === id);
    if (index >= 0) {
      idList.splice(index, 1);
      this.utils.dashbroadSeqService.set(idList.join(","));
    }
    const delRes = await dashboard.destroy();
    if (this.ctx.sysLogger && typeof this.ctx.sysLogger === "function") {
      /** 写日志 */
      this.ctx.sysLogger({
        content: `仪表盘名称: ${dashboard.name}`,
        type: ELogOperareType.DELETE,
        target: ELogOperareTarget.DASHBOARD,
      });
    }
    return delRes;
  }

  /** 硬删除仪表盘 如果存在 */
  async forceDeleteDashboardIfExist(id: string) {
    try {
      // let existDashboard = false;
      // existDashboard = !!(await DashboardModel.findOne({
      //   where: { id },
      //   paranoid: false,
      // }));
      // if (existDashboard) {
      DashboardModel.destroy({
        where: {
          id,
        },
        force: true,
      });
      // }
    } catch (e) {}
  }

  async importDashboard(fileContent: string) {
    const dashboardList = JSON.parse(fileContent);
    for (const dashboard of dashboardList) {
      const { id } = dashboard;
      await this.forceDeleteDashboardIfExist(id);
      let newDashboard = {
        ...dashboard,
        specification: JSON.stringify(dashboard.specification),
      };
      if (newDashboard?.widget_ids) {
        /** 修改widget和dashboard内数据的id */
        const { widgets } = dashboard || { widgets: [] };
        if (widgets) {
          await this.widgetService.importWidget(JSON.stringify(widgets));
        }
        await DashboardModel.create(newDashboard);
      } else {
        throw new Error(
          `仪表盘:${dashboard?.name || dashboard?.id}导入数据有误,请检查文件!`
        );
      }
    }
  }

  /** 初始化默认仪表盘 */
  async initDefaultDashboard() {
    /** 目标文件夹路径 */
    const defaultDashboardDirPath = this.config?.init?.dashboard;

    const version = this.config?.bi_mode || "main";

    /** 文件夹下文件名称列表 */
    const dashboardNameList = fs
      .readdirSync(defaultDashboardDirPath)
      .filter((name) => name !== ".DS_Store");
      this.logger.error('init dashboard')
      this.logger.error(defaultDashboardDirPath)
      this.logger.error(dashboardNameList)
    for (const dashboardName of dashboardNameList) {
      const dashboardPath = `${path.join(
        defaultDashboardDirPath,
        dashboardName
      )}`;
      const dashboardJson = fs.readFileSync(dashboardPath, "utf-8");
      const dashboardInfo = JSON.parse(dashboardJson)[0];
      if (dashboardName === "index.bi") {
        if (version === "main" && !isCms) {
          await this.importDashboard(
            JSON.stringify([
              {
                ...dashboardInfo,
                name: SYSTEM_DASHBOARD_NAME,
                id: SYSTEM_DASHBOARD_ID,
              },
            ])
          );
        } else {
          continue;
        }
      } else if (dashboardName === "index-11j.bi") {
        if (version === "11j") {
          await this.importDashboard(
            JSON.stringify([
              {
                ...dashboardInfo,
                name: SYSTEM_DASHBOARD_NAME,
                id: SYSTEM_DASHBOARD_ID,
              },
            ])
          );
        } else {
          continue;
        }
      } else if (dashboardName === "index-cms.bi") {
        if (isCms) {
          await this.importDashboard(
            JSON.stringify([
              {
                ...dashboardInfo,
                name: SYSTEM_DASHBOARD_NAME,
                id: SYSTEM_DASHBOARD_ID,
              },
            ])
          );
        }
      } else {
        await this.importDashboard(
          JSON.stringify([
            {
              ...dashboardInfo,
            },
          ])
        );
      }
    }

    /** 初始化顺序 */
    const seqIds = await this.utils.dashbroadSeqService.get();
    await this.utils.dashbroadSeqService.set(
      [
        SYSTEM_DASHBOARD_ID,
        ...seqIds
          .replace(SYSTEM_DASHBOARD_ID, "")
          .split(",")
          .filter((f) => f),
      ].join(",")
    );
  }
}
