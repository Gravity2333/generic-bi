import { EBIVERSION, IClickhouseResponseFactory } from "@bi/common";
import { Inject, Logger, Provide } from "@midwayjs/decorator";
import { IMidwayLogger } from "@midwayjs/logger";
import * as dayjs from "dayjs";
import * as timezone from "dayjs/plugin/timezone";
import * as utc from "dayjs/plugin/utc";
import { Context } from "egg";
import { base64Encode } from "../utils";
const isCms = process.env.BI_VERSION === EBIVERSION.CMS;

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
  async executeSql(sql: string, ch_status?: boolean): Promise<any[]> {
    // 处理错误
    try {
      let querResult = null;

      const queryClickhouse = async (querySql) => {
        if (this?.ctx?.app?.clickhouseClient?.querying) {
          return await this.ctx.app.clickhouseClient.querying<
            any,
            IClickhouseResponseFactory<any[]>
          >(querySql);
        } else {
          return await (global as any)?.app?.clickhouseClient?.querying(
            querySql
          );
        }
      };

      const queryChStatus = async (querySql) => {
        if (this?.ctx?.app?.chStatusClient?.querying) {
          return await this.ctx.app.chStatusClient.querying<
            any,
            IClickhouseResponseFactory<any[]>
          >(querySql);
        } else {
          return await (global as any)?.app?.chStatusClient?.querying(querySql);
        }
      };

      if (isCms) {
        querResult = await queryClickhouse(sql);
      } else {
        if (ch_status) {
          querResult = await queryChStatus(sql);
        } else {
          querResult = await queryClickhouse(sql);
        }
      }

      return querResult.data;
    } catch (error) {
      this.ctx?.throw(500, error);
    }
  }

  /**
   * 查询 SQL 的查询计划
   * @param sql sql 语句
   * @returns sql 的查询计划
   */
  async querySqlExplain(sql: string, ch_status?: boolean): Promise<string> {
    // 查看 sql 的执行计划
    try {
      let explainPlan = "";
      if (isCms) {
        await this.ctx.app.clickhouseClient.querying<any, null>(
          `EXPLAIN PLAN header=1,actions=1 ${sql.replace(/\n/g, " ")}`,
          {
            // 这里一定使用这个，否则 CH 客户端会进行 json 处理导致报错
            // @see: https://clickhouse.com/docs/en/interfaces/formats/#data-format-values
            format: "Values",
          }
        );
      } else {
        if (ch_status) {
          await this.ctx.app.chStatusClient.querying<any, null>(
            `EXPLAIN PLAN header=1,actions=1 ${sql.replace(/\n/g, " ")}`,
            {
              // 这里一定使用这个，否则 CH 客户端会进行 json 处理导致报错
              // @see: https://clickhouse.com/docs/en/interfaces/formats/#data-format-values
              format: "Values",
            }
          );
        } else {
          await this.ctx.app.clickhouseClient.querying<any, null>(
            `EXPLAIN PLAN header=1,actions=1 ${sql.replace(/\n/g, " ")}`,
            {
              // 这里一定使用这个，否则 CH 客户端会进行 json 处理导致报错
              // @see: https://clickhouse.com/docs/en/interfaces/formats/#data-format-values
              format: "Values",
            }
          );
        }
      }
      return explainPlan;
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

    queryIds.forEach(async (queryId) => {
      if (isCms) {
        await this.ctx.app.clickhouseClient.querying<
          any,
          IClickhouseResponseFactory<any[]>
        >(
          "KILL QUERY WHERE query_id IN (SELECT query_id FROM system.processes WHERE query LIKE '%/*" +
            base64Encode(queryId) +
            "*/%')"
        );
      } else {
        await this.ctx.app.clickhouseClient.querying<
          any,
          IClickhouseResponseFactory<any[]>
        >(
          "KILL QUERY WHERE query_id IN (SELECT query_id FROM system.processes WHERE query LIKE '%/*" +
            base64Encode(queryId) +
            "*/%')"
        );
        await this.ctx.app.chStatusClient.querying<
          any,
          IClickhouseResponseFactory<any[]>
        >(
          "KILL QUERY WHERE query_id IN (SELECT query_id FROM system.processes WHERE query LIKE '%/*" +
            base64Encode(queryId) +
            "*/%')"
        );
      }
    });

    this.logger.debug(
      "finish to cancel queries, queryIds: [{}], result: [{}]",
      queryIds.join(", ")
    );
  }
}
