import {
  IDatasetTable,
} from "@bi/common";
import { Inject, Logger, Provide } from "@midwayjs/decorator";
import { IMidwayLogger } from "@midwayjs/logger";
import * as dayjs from "dayjs";
import * as timezone from "dayjs/plugin/timezone";
import * as utc from "dayjs/plugin/utc";
import { Context } from "egg";

dayjs.extend(utc);
dayjs.extend(timezone);

@Provide()
export class ClickHouseService {
  @Inject()
  ctx: Context;

  @Logger()
  readonly logger: IMidwayLogger;

  /**
   * 执行 SQL 查询语句
   * @param sql sql 语句
   * @returns 查询结果
   */
  async executeSql(sql: string): Promise<any> {
    // 处理错误
    try {
      return await this.ctx.app.externalSystemClient.querying<IDatasetTable[]>(
        sql
      );
    } catch (error) {
      this.ctx?.throw(500, error);
    }
  }


  /**
   * 根据查询 ID 取消查询
   * @param queryIds 查询 IDs
   */
  async cancelQueries(queryIds: string[]): Promise<any> {
    if (queryIds.length === 0) {
      this.ctx?.throw(400, "queryIds must not be empty");
    }

    // queryIds.forEach(async (queryId) => {
    //   if (isCms) {
    //     await this.ctx.app.clickhouseClient.querying<
    //       any,
    //       IClickhouseResponseFactory<any[]>
    //     >(
    //       "KILL QUERY WHERE query_id IN (SELECT query_id FROM system.processes WHERE query LIKE '%/*" +
    //         base64Encode(queryId) +
    //         "*/%')"
    //     );
    //   } else {
    //     await this.ctx.app.clickhouseClient.querying<
    //       any,
    //       IClickhouseResponseFactory<any[]>
    //     >(
    //       "KILL QUERY WHERE query_id IN (SELECT query_id FROM system.processes WHERE query LIKE '%/*" +
    //         base64Encode(queryId) +
    //         "*/%')"
    //     );
    //     await this.ctx.app.chStatusClient.querying<
    //       any,
    //       IClickhouseResponseFactory<any[]>
    //     >(
    //       "KILL QUERY WHERE query_id IN (SELECT query_id FROM system.processes WHERE query LIKE '%/*" +
    //         base64Encode(queryId) +
    //         "*/%')"
    //     );
    //   }
    // });

    this.logger.debug(
      "finish to cancel queries, queryIds: [{}], result: [{}]",
      queryIds.join(", ")
    );
  }
}
