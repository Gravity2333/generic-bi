import { IMidwayLogger } from "@midwayjs/logger";
import { ALL, Config, Inject, Logger, Provide } from "@midwayjs/decorator";
import NpmdDictMappingModel from "../model/npmdDictMapping";
import { CreateNpmdDictInput, UpdateNpmdDictInput } from "../dto/npmDict.dto";
import { Context } from "@midwayjs/web";
import { readFileSync } from "fs";
import { IMyAppConfig } from "../interface";
import path = require("path");

@Provide()
export class NpmdDictMappingService {
  @Inject()
  ctx: Context;

  @Config(ALL)
  config: IMyAppConfig;

  @Logger()
  readonly logger: IMidwayLogger;

  /**
   * 查询某个表下的字段关联关系
   * @param tableName 表名
   * @returns
   */
  async listDictMappingByTableName(tableName?: string) {
    const { rows } = await NpmdDictMappingModel.findAndCountAll({
      where: {
        ...(tableName ? { table_name: tableName } : {}),
      },
      order: [["created_at", "DESC"]],
    });

    // 组装成方便使用的对象结构
    const dictMappingMap: Record<string, string> = {};

    rows.forEach((row) => {
      dictMappingMap[`${row.table_name}__${row.table_field}`] = row.dict_field;
    });

    return {
      dictMappingList: rows,
      dictMappingMap,
    };
  }

  async getDictMappingById(id: string) {
    const report = await NpmdDictMappingModel.findByPk(id);
    if (!report) {
      this.ctx?.throw(404, "npmd dict mapping not found");
    }
    return report;
  }

  /**
   * 创建某个表下的字段关联关系
   */
  async createDictMapping(dictMappingFormData: CreateNpmdDictInput) {
    //@ts-ignore
    return await NpmdDictMappingModel.create(dictMappingFormData);
  }

  /**
   * 编辑某个表下的字段关联关系
   */
  async updateDictMapping({ id, ...updates }: UpdateNpmdDictInput) {
    const mapping = await this.getDictMappingById(id);
    return await mapping.update(updates);
  }

  /**
   * 编辑某个表下的字段关联关系
   */
  async deleteDictMapping(id: string) {
    const mapping = await this.getDictMappingById(id);
    return await mapping.destroy({
      // 强制删除
      force: true,
    });
  }

  /** 初始化字典 */
  async initDictMapping() {
    try {
      const sql = await readFileSync(
        path.join(this.config.dict.mapping, "init_data.sql")
      )?.toString();
      const dictMappingSqlList = sql
        ?.split("VALUES")[1]
        ?.replace(/\n/g, "")
        .slice(1, -1)
        .split("),(")
        .map((s) => s?.split(","));
      const dictMappingList = dictMappingSqlList?.map((sqlList) => {
        return {
          table_name: sqlList[1].replace(/'/g, ""),
          table_field: sqlList[2].replace(/'/g, ""),
          dict_field: sqlList[3].replace(/'/g, ""),
        };
      });
      await NpmdDictMappingModel.destroy({
        where: {},
        force: true,
      });
      NpmdDictMappingModel.bulkCreate(dictMappingList);
    } catch (e) {
      this.logger.error(e);
    }
  }

  
}
