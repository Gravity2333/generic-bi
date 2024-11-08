import { EDatabaseType } from "@bi/common";
import {
  ALL,
  Body,
  Controller,
  Inject,
  Post,
  Provide,
} from "@midwayjs/decorator";
import { Context } from "egg";
import { NpmdDictMappingService } from "../service/npmdDictMapping";
import { DatabaseService } from "../service/database";

/** 元元数据详单表 */
// const PROTOCOL_RECORD_REG = /d_fpc_protocol_([a-zA-Z0-9]+)_log_record/g;

const DATA_SET_QUERY_MAP = {
  [EDatabaseType.POSTGRE]: `SELECT tablename as name FROM pg_catalog.pg_tables WHERE schemaname != 'pg_catalog' AND schemaname != 'information_schema'`,
  [EDatabaseType.CLICKHOUSE]:
    "SELECT name, comment FROM system.tables WHERE name LIKE '%d_fpc_%'",
};

const _GET_DATA_SET_COLUMN_QUERY_MAP = (tableName: string) => ({
  [EDatabaseType.POSTGRE]: `select
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
              order by c.relname,a.attnum;`,
  [EDatabaseType.CLICKHOUSE]: `desc ${tableName}`,
});

@Provide()
@Controller("/web-api/v1")
export class DatasetAPIController {
  @Inject()
  ctx: Context;

  @Inject()
  npmdDictMappingService: NpmdDictMappingService;

  @Inject()
  databaseService: DatabaseService;

  @Post("/datasets")
  async listAllDatasets(@Body(ALL) { database }: { database: string }) {
    return await this.databaseService.executeSql(DATA_SET_QUERY_MAP, database);
  }

  @Post("/datasets/columns")
  async listDatasetColumns(
    @Body(ALL) { database, tableName }: { database: string; tableName: string }
  ) {
    // 判断查询两个表
    const recordData = await this.databaseService.executeSql(
      _GET_DATA_SET_COLUMN_QUERY_MAP(tableName),
      database
    );

    return recordData;
  }
}
