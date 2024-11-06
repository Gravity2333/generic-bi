import { EDatabaseType } from "@bi/common";
import { Controller, Get, Inject, Param, Provide } from "@midwayjs/decorator";
import { Context } from "egg";
import { NpmdDictMappingService } from "../service/npmdDictMapping";
import { DatabaseService } from "../service/database";

/** 元元数据详单表 */
// const PROTOCOL_RECORD_REG = /d_fpc_protocol_([a-zA-Z0-9]+)_log_record/g;

@Provide()
@Controller("/web-api/v1")
export class DatasetAPIController {
  @Inject()
  ctx: Context;

  @Inject()
  npmdDictMappingService: NpmdDictMappingService;

  @Inject()
  databaseService: DatabaseService;

  @Get("/datasets")
  async listAllDatasets() {
    /** 由于探针的详单和统计数据存在两个数据库中，所以要查询两个并且拼接 */
    /** 探针和cms都默认采用d_fpc开头的表,不再采用t_fpc开头的表,需要在此过滤掉 */
    const recordData = await (async () => {
      if (this.databaseService?.type === EDatabaseType.POSTGRE) {
        return await await this.databaseService.executeSql(
          `SELECT tablename as name FROM pg_catalog.pg_tables WHERE schemaname != 'pg_catalog' AND schemaname != 'information_schema'`
        );
      } else if (this.databaseService?.type === EDatabaseType.CLICKHOUSE) {
        return await await this.databaseService.executeSql(
          "SELECT name, comment FROM system.tables WHERE name LIKE '%d_fpc_%'"
        );
      }
    })();
    return recordData;
  }

  @Get("/datasets/:tableName/columns")
  async listDatasetColumns(@Param() tableName: string) {
    // 判断查询两个表
    const recordData = await (async () => {
      if (this.databaseService?.type === EDatabaseType.POSTGRE) {
        return await await this.databaseService.executeSql(`select
              a.attname name,
              d.description comment,
              concat_ws('',t.typname,SUBSTRING(format_type(a.atttypid,a.atttypmod) from '(.*)')) as type
              from
              pg_class c,
              pg_attribute a,
              pg_type t,
              pg_description d
              where
              a.attnum>0
              and
              a.attrelid=c.oid
              and
              a.atttypid=t.oid
              and
              d.objoid=a.attrelid
              and
              d.objsubid=a.attnum
              and
              c.relname in (
              select
              tablename
              from
              pg_tables
              where
              schemaname='public'
              and
              position('_2' in tablename)=0
              )
              and c.relname = '${tableName}'
              order by c.relname,a.attnum;`);
      } else if (this.databaseService?.type === EDatabaseType.CLICKHOUSE) {
        return await await this.databaseService.executeSql(`desc ${tableName}`);
      }
    })();
    // // 获取字段管理关系
    // const { dictMappingMap } =
    //   await this.npmdDictMappingService.listDictMappingByTableName(tableName);

    // for (let index = 0; index < data.length; index++) {
    //   const column = data[index];

    //   const key = `${tableName}__${column.name}`;
    //   if (dictMappingMap[key]) {
    //     column.dict_field = dictMappingMap[key];
    //   }
    // }

    return recordData;
  }
}
