import {
  _GET_DATA_SET_COLUMN_QUERY_MAP,
  DATA_SET_QUERY_MAP,
} from "@bi/common";
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
      _GET_DATA_SET_COLUMN_QUERY_MAP(database, tableName),
      database
    );
    return recordData;
  }
}
