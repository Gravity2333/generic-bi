import { Inject, Provide } from "@midwayjs/decorator";
import { CreateWidgetInput, UpdateWidgetInput } from "../dto/widget.dto";
import WidgetModel from "../model/widget";
import { Context } from "joi";
import { Op } from "sequelize";
import { EVisualizationType } from "@bi/common";
import { Utils } from "../utils";
import { DashboardService } from "./dashboard";

@Provide()
export class SqlLabService {
  @Inject()
  ctx: Context;

  @Inject()
  utils: Utils;

  @Inject()
  dashboardService: DashboardService;

  async listAllSqlJson(): Promise<WidgetModel[]> {
    const { rows } = await WidgetModel.findAndCountAll({
      where: { viz_type: { [Op.like]: EVisualizationType.SQL } },
      order: [["created_at", "DESC"]],
    });
    const ids = await this.utils.sqlJsonSeqService.get();
    const idList = (ids?.split(",") || [])?.filter((f) => f);
    const results = idList
      .map((id) => {
        const index = rows.findIndex((r) => r?.id === id);
        if (index > -1) {
          const d = rows[index];
          rows.splice(index, 1);
          return d;
        }
        return undefined;
      })
      .filter((f) => f);
    return [...rows, ...results];
  }

  async getSqlJsonById(id: string): Promise<WidgetModel> {
    const sqlJson = await WidgetModel.findByPk(id);
    if (!sqlJson) {
      this.ctx?.throw(404, "sql info not found");
    }
    return sqlJson;
  }

  async createSqlJson(sqlJson: CreateWidgetInput): Promise<WidgetModel> {
    //@ts-ignore
    return await WidgetModel.create(sqlJson);
  }

  async updateSqlJson({ id, ...updates }: UpdateWidgetInput) {
    const target = await this.getSqlJsonById(id);
    return await target.update(updates);
  }

  async deleteSqlJson(id: string) {
    // 检查 sqljson 是否已经被应用
    const dashboard = await this.dashboardService.getDashboardByWidgetId(id);
    if (dashboard) {
      this.ctx?.throw(500, `已被 Dashboard 【${dashboard.name}】使用，无法删除`);
    }

    const sqlJson = await this.getSqlJsonById(id);
    const ids = await this.utils.sqlJsonSeqService.get();
    const idList = (ids?.split(",") || [])?.filter((f) => f);
    const index = idList.findIndex((i) => i === id);
    if (index >= 0) {
      idList.splice(index, 1);
      this.utils.sqlJsonSeqService.set(idList.join(","));
    }
    return await sqlJson.destroy();
  }
}
