import {
  ALL,
  Controller,
  Get,
  Inject,
  Provide,
  Query,
} from "@midwayjs/decorator";
import { Context } from "egg";
import { ClickHouseService } from "../service/clickhouse";
import { NpmdDictService } from "../service/npmdDict";
import { base64Encode } from "../utils";
import { GlobalService } from "./../service/global";

@Provide()
@Controller("/web-api/v1")
export class ApiController {
  @Inject()
  ctx: Context;

  @Inject()
  globalService: GlobalService;

  @Inject()
  clickhouseService: ClickHouseService;

  @Inject()
  npmdDictService: NpmdDictService;

  @Get("/active-assets")
  async queryActiveAssets(
    @Query(ALL)
    { from, to, queryId }: { from: number; to: number; queryId: string }
  ) {
    // 标识查询 ID，用于取消查询
    const securityQueryId = queryId ? `/*${base64Encode(queryId)}*/ ` : "";
    const sql = `SELECT count(1)
    FROM
    (
        SELECT
            ip,
            timestamp
        FROM
        (
            SELECT
                ip,
                maxMerge(latest_time) AS timestamp
            FROM d_fpc_asset_newest
            GROUP BY ip
        )
        WHERE (timestamp >= '${from}') AND (timestamp < '${to}')
    )`;
    const fullSql = sql + securityQueryId;
    // 可能携带查询 ID 的完整 sql 语句
    const l = await this.clickhouseService.executeSql(fullSql);
    return l[0]["count()"];
  }

  @Get("/new-found-assets")
  async queryNewFoundAssets(
    @Query(ALL)
    { from, to, queryId }: { from: number; to: number; queryId: string }
  ) {
    // 标识查询 ID，用于取消查询
    const securityQueryId = queryId ? `/*${base64Encode(queryId)}*/ ` : "";
    const sql = `
    SELECT count(1)
    FROM
    (
        SELECT
            ip,
            timestamp
        FROM
        (
            SELECT
                ip,
                minMerge(timestamp) AS timestamp
            FROM d_fpc_asset_first
            GROUP BY ip
        )
        WHERE (timestamp >= '${from}') AND (timestamp < '${to}')
    )`;
    // 可能携带查询 ID 的完整 sql 语句
    const fullSql = sql + securityQueryId;
    const l = await this.clickhouseService.executeSql(fullSql);
    return l[0]["count()"];
  }

  @Get("/alarm")
  async queryAlarms(@Query(ALL) { from, to }: { from: string; to: string }) {
    return await this.npmdDictService.getAlarmFromRestApi(from, to);
  }

  @Get("/custom-times")
  async queryCustomTimes() {
    return await this.npmdDictService.getCustomTimesFromRestApi();
  }

  @Get("/platform")
  async queryPlatform() {
    return process.env.PLATFORM;
  }

  @Get("/mail-configs")
  async queryMailConfig() {
    const mapping = await this.globalService.getMailConfig();
    // 删除密码
    delete mapping?.login_password;
    return mapping ?? {};
  }

  @Get("/online-sensor")
  async queryOnlineSensor() {
    try {
      await this.ctx.app.clickhouseClient.querying<
        any,
        // @ts-ignores
        IClickhouseTable
      >("SELECT * FROM d_fpc_flow_log_record LIMIT 0");
      return { online: true };
    } catch (e) {
      return { online: false, msg: e };
    }
  }

  @Get("/bi-version")
  async queryBiVersion() {
    return process.env.BI_VERSION;
  }

  @Get("/current-user")
  async querCurrentUserInfo(
    @Query(ALL)
    { token }: { token: string }
  ) {
    return await this.globalService.parseToken(token);
  }

  @Get("/*")
  async Error404() {
    return this.ctx?.throw(404, `[API Not Found] ${this.ctx.request.URL}`);
  }
}
