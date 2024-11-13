import {
  EAttachmentType,
  EFormatterType,
  EVisualizationType,
  IPageFactory,
  ITimeRange,
  IWidgetSpecification,
  formatValue,
  generateSql,
  parseObjJson,
} from "@bi/common";
import { ALL, Config, Inject, Logger, Provide } from "@midwayjs/decorator";
import { Context } from "egg";
import { Op } from "sequelize";
import { CreateWidgetInput, UpdateWidgetInput } from "../dto/widget.dto";
import WidgetModel from "../model/widget";
import { IMidwayLogger } from "@midwayjs/logger";
import {
  base64Encode,
  downloadWidgetCSV,
  downloadWidgetExcel,
  getPagination,
} from "../utils";
import { DashboardService } from "./dashboard";
import { NpmdDictService } from "./dicts";
import { EBooleanString, IMyAppConfig } from "../interface";
import * as fs from "fs";
import path = require("path");
import { ELogOperareTarget, ELogOperareType } from "./systemLog";
import { DatabaseService } from "./database";

@Provide()
export class WidgetService {
  @Inject()
  ctx: Context;

  @Inject()
  dashboardService: DashboardService;

  @Logger()
  readonly logger: IMidwayLogger;

  @Config(ALL)
  config: IMyAppConfig;


  @Inject()
  databaseService: DatabaseService;

  @Inject()
  npmdDictService: NpmdDictService;

  async listWidgets(
    pageNumber: number,
    pageSize: number,
    name?: string
  ): Promise<IPageFactory<WidgetModel>> {
    const paging = getPagination(pageNumber, pageSize);

    const { rows, count } = await WidgetModel.findAndCountAll({
      ...paging,
      where: {
        viz_type: { [Op.not]: EVisualizationType.SQL },
        ...(name ? { name: { [Op.like]: `%${name}%` } } : {}),
      },
      order: [["created_at", "DESC"]],
    });

    return {
      rows,
      total: count,
      ...paging,
    };
  }

  async listAllTemplateWidgets(): Promise<WidgetModel[]> {
    const { rows } = await WidgetModel.findAndCountAll({
      order: [["created_at", "DESC"]],
      where: {
        viz_type: { [Op.not]: EVisualizationType.SQL },
        template: { [Op.like]: EBooleanString.True },
      },
    });
    return rows;
  }

  async listAllWidgets(): Promise<WidgetModel[]> {
    const { rows } = await WidgetModel.findAndCountAll({
      where: {
        viz_type: { [Op.not]: EVisualizationType.SQL },
      },
      order: [["created_at", "DESC"]],
    });
    return rows;
  }

  async getWidgetById(id: string): Promise<WidgetModel> {
    const widget = await WidgetModel.findByPk(id);
    if (!widget) {
      this.ctx?.throw(404, "Widget not found");
    }
    return widget;
  }

  /**
   * 根据 ID 查询多个 Widget
   * @param ids ids
   * @returns
   */
  async getWidgetByIds(ids: string[]): Promise<WidgetModel[]> {
    if (ids.length === 0) {
      return [];
    }
    const widgets = await WidgetModel.findAll({
      where: {
        id: { [Op.in]: ids },
      },
    });
    return widgets;
  }

  async getWidgetSpecification(id: string): Promise<IWidgetSpecification> {
    const widget = await WidgetModel.findByPk(id);
    if (!widget) {
      this.ctx?.throw(404, "Widget not found");
    }

    // 解析
    const json = parseObjJson<IWidgetSpecification>(widget.specification);
    return json;
  }

  async createWidget(widget: CreateWidgetInput): Promise<WidgetModel> {
    //@ts-ignore
    return await WidgetModel.create(widget);
  }

  async updateWidget({ id, ...updates }: UpdateWidgetInput) {
    const target = await this.getWidgetById(id);
    return await target.update(updates);
  }

  async deleteWidget(id: string) {
    const widget = await this.getWidgetById(id);
    // 检查 widget 是否已经被应用
    const dashboard = await this.dashboardService.getDashboardByWidgetId(
      widget.id
    );
    if (dashboard) {
      this.ctx?.throw(
        500,
        `已被 Dashboard 【${dashboard.name}】使用，无法删除`
      );
    }

    const res = await widget.destroy();
    if (this.ctx.sysLogger && typeof this.ctx.sysLogger === "function") {
      this.ctx.sysLogger({
        content: `图表名称: ${widget.name}`,
        type: ELogOperareType.DELETE,
        target: ELogOperareTarget.WIDGET,
      });
    }
    return res;
  }

  async batchDeleteWidget(ids: string[]) {
    const delNames = [];
    for (let id of ids) {
      const widget = await this.getWidgetById(id);
      delNames.push(widget.name);
      // 检查 widget 是否已经被应用
      const dashboard = await this.dashboardService.getDashboardByWidgetId(
        widget.id
      );
      if (dashboard) {
        throw new Error(
          `图表:${widget?.name || id}已被 Dashboard 【${dashboard.name
          }】使用，无法删除`
        );
      }
      await widget.destroy();
      if (this.ctx.sysLogger && typeof this.ctx.sysLogger === "function") {
        this.ctx.sysLogger({
          content: `图表名称: [${delNames.join(",")}]`,
          type: ELogOperareType.BATCH_DELETE,
          target: ELogOperareTarget.WIDGET,
        });
      }
    }
  }

  // 硬删除仪表盘如果存在
  async forceDeleteWidgetIfExist(id: string) {
    try {
      // let exist = false;
      // exist = !!(await WidgetModel.findOne({
      //   where: { id },
      //   paranoid: false,
      // }));
      // if (exist) {
      await WidgetModel.destroy({
        where: {
          id,
        },
        force: true,
      });
      // }
    } catch (e) { }
  }

  async importWidget(fileContent: string) {
    const widgetList = JSON.parse(fileContent);
    for (const widget of widgetList) {
      if (widget?.datasource) {
        await this.forceDeleteWidgetIfExist(widget?.id);
        await WidgetModel.create({
          ...widget,
        });
      } else {
        throw new Error(
          `图表:${widget?.name || widget?.id}导入数据有误,请检查文件!`
        );
      }
    }
  }

  /** 检查数据源是否正确 */
  async checkWidgetSource() {
    try {
      const errorSourceData = (
        await WidgetModel.findAll({
          where: {
            datasource: { [Op.like]: `t_fpc%` },
          },
        })
      )?.map((d) => d["dataValues"]);

      const newSouceData = errorSourceData?.map((d) => {
        const specification = JSON.parse(d.specification);
        const datasource = d.datasource.replace(/^t_fpc_/, "d_fpc_");
        return {
          id: d.id,
          name: d.name,
          datasource,
          viz_type: d.viz_type,
          specification: JSON.stringify({
            ...specification,
            datasource,
          }),
          description: d.description,
          readonly: d.readonly,
          created_at: d.created_at,
          updated_at: d.updated_at,
        };
      });

      if (newSouceData?.length > 0) {
        /** 批量删除旧版信息 */
        await WidgetModel.destroy({
          where: {
            datasource: { [Op.like]: `t_fpc%` },
          },
          force: true,
        });
        await WidgetModel.bulkCreate(newSouceData);
      }
      this.logger.info(`[BI启动自检]:图表数据源检查成功!`);
    } catch (e) {
      this.logger.error(`[BI启动自检]:图表数据源检查错误，错误信息:${e}`);
    }
  }

  async exportWidgetTable(
    id: string,
    type: Exclude<`${EAttachmentType}`, `${EAttachmentType.PDF}`>,
    /** 全局时间 */
    time_range?: string,
    time_grain?: "1m" | "5m" | "1h"
  ) {
    let widget = await this.getWidgetById(id);
    const { specification, name } = widget;
    let widgetSpec = parseObjJson<IWidgetSpecification>(specification);
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

    const { metrics, groupby, database } = widgetSpec;
    // colName字典
    const colInfoMap = [...metrics, ...groupby].reduce((prev, curr: any) => {
      const index = curr.id || curr.field;
      return {
        ...prev,
        [index]: curr,
      };
    }, {});
    // 获取所有匹配字典
    const dicts = (await this.npmdDictService.queryDicts()).reduce(
      (prev, curr) => {
        return {
          ...prev,
          [curr.id]: curr.dict,
        };
      },
      {}
    );
    const DBType = this.ctx.app.externalSystemClient[database]?.type
    // 转成 sql 语句
    const { sql, colNames, colIdList } = generateSql(
      widgetSpec,
      DBType
    );

    // 标识查询 ID，用于取消查询
    let securityQueryId = id ? `/*${base64Encode(id)}*/ ` : "";
    let fullSql = sql + securityQueryId;

    let sqlData = await this.databaseService.executeSql(fullSql, database);
    // 匹配标题名称
    const titleNameList = colIdList?.map((id) => {
      const c = colInfoMap[id];
      return c.display_name || c.field;
    });
    // 单独处理曲线图导出，加入时间列
    if (widget.viz_type === EVisualizationType.TimeHistogram) {
      colNames.push("TIMESTAMP");
      colIdList.push("TIMESTAMP");
      titleNameList.push("时间");
    }

    if (type === "csv") {
      // 格式化数据
      const dataList = sqlData?.map((d) => {
        const obj = {};
        for (let i = 0; i < colIdList.length; i++) {
          const colIndex = colNames[i];
          const colObj = colInfoMap[colIdList[i]] || {};
          const titleName = titleNameList[i];
          // 格式化
          const { column_format, dict_field } = colObj as any;
          const colValue = d[colIndex];
          if (dict_field) {
            // 处理字典
            const dict = dicts[dict_field];
            obj[titleName] = dict[colValue];
            continue;
          } else if (column_format && column_format !== EFormatterType.Raw) {
            // 处理格式化
            obj[titleName] = formatValue(
              parseFloat(colValue),
              column_format as EFormatterType
            );
            continue;
          }
          obj[titleName] = colValue;
        }
        return obj;
      });
      const csv = downloadWidgetCSV({
        titleNameList,
        dataList,
      });
      return [name, csv];
    } else if (type === "excel") {
      // 格式化数据
      const dataList = sqlData?.map((d) => {
        const list = [];
        for (let i = 0; i < colIdList.length; i++) {
          const colIndex = colNames[i];
          const colObj = colInfoMap[colIdList[i]] || {};
          // 格式化
          const { column_format, dict_field } = colObj as any;
          const colValue = d[colIndex];
          if (dict_field) {
            // 处理字典
            const dict = dicts[dict_field];
            list.push(dict[colValue] || colValue);
            continue;
          } else if (column_format && column_format !== EFormatterType.Raw) {
            // 处理格式化
            list.push(
              formatValue(parseFloat(colValue), column_format as EFormatterType)
            );
            continue;
          }
          list.push(colValue);
        }
        return list;
      });
      const excel = await downloadWidgetExcel([
        {
          sheetName: name,
          titleNameList,
          dataList,
        },
      ]);
      return [name, excel];
    }
  }

  async initDefaultWidget() {
    /** 目标文件夹路径 */
    const defaultWidgetDirPath = this.config?.init?.dashboard?.replace(
      "/dashboard",
      "/widget"
    );
    /** 文件夹下文件名称列表 */
    const widgetNameList = fs
      .readdirSync(defaultWidgetDirPath)
      .filter((name) => name !== ".DS_Store")
      .filter((name) => name !== "placeholder");
    for (const widgetName of widgetNameList) {
      const widgetPath = `${path.join(defaultWidgetDirPath, widgetName)}`;
      const widgetJson = fs.readFileSync(widgetPath, "utf-8");
      await this.importWidget(widgetJson);
    }
  }
}
