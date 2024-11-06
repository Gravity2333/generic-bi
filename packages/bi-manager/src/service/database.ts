import { ALL, App, Config, Inject, Logger, Provide } from "@midwayjs/decorator";
import { Context } from "egg";
import { IMidwayLogger } from "@midwayjs/logger";
import { NpmdDictService } from "./dicts";
import { IMyAppConfig } from "../interface";
import DatabaseModel from "../model/database";
import { UpdateDatabseInput } from "../dto/database.dto";
import { EDatabaseType, ExternalSystem, IDatasetTable } from "@bi/common";
import * as ClickHouse from "@posthog/clickhouse";
import { Application } from "@midwayjs/web";
import { Pool } from "pg";

let DBType = null;

@Provide()
export class DatabaseService {
  @Inject()
  ctx: Context;

  @Logger()
  readonly logger: IMidwayLogger;

  @Config(ALL)
  config: IMyAppConfig;

  @Inject()
  npmdDictService: NpmdDictService;

  @App()
  app: Application;

  set type(t: EDatabaseType) {
    DBType = t;
  }

  get type() {
    return DBType;
  }

  async getInfo(): Promise<DatabaseModel> {
    const { rows } = await DatabaseModel.findAndCountAll();
    return rows[0] || ({} as any);
  }

  async getParsedInfo(): Promise<{
    type: EDatabaseType;
    option: Record<string, any>;
  }> {
    const { rows } = await DatabaseModel.findAndCountAll();
    if (!rows[0]) {
      return;
    }

    return {
      type: rows[0].type as EDatabaseType,
      option: JSON.parse(rows[0].option || "{}"),
    };
  }

  async configDatabase(databaseConfig: UpdateDatabseInput) {
    const id = databaseConfig.id;
    if (databaseConfig.id) {
      const target = await DatabaseModel.findByPk(id);
      if (!target) {
        this.ctx?.throw(404, "数据库配置未找到！");
      }
      await target.update(databaseConfig);
      return this.initDatabase();
    }
    //@ts-ignore
    await DatabaseModel.create(databaseConfig);
    return this.initDatabase();
  }

  initDatabase = async () => {
    // 初始化 外部系统 客户端
    // =======================
    const databaseConfig = await this.getParsedInfo();
    if (Object.keys(databaseConfig)?.length === 0) {
      return;
    }

    const { type, option } = databaseConfig;

    switch (type) {
      case EDatabaseType.POSTGRE:
        // 处理postgre
        const pool = new Pool({
          user: option?.user,
          password: option?.password,
          host: option?.host,
          port: option?.port,
          database: option?.database,
          max: 20, // 连接池中最大的连接数
          idleTimeoutMillis: 30000, // 一个连接被回收前可以保持空闲的时间
          connectionTimeoutMillis: 2000, // 建立连接时的超时时间
        });
        this.app.externalSystemClient = {
          querying: function <T>(sql: string) {
            return new Promise<{ data: T }>((resolve, reject) => {
              pool.connect((err, client, done) => {
                if (err) reject(err);
                // 执行查询
                client?.query(sql, (err, res) => {
                  if (err) {
                    done();
                    reject(err);
                  } else {
                    done();
                    resolve(res.rows);
                  }
                });
              });
            });
          },
        };
        this.type = EDatabaseType.POSTGRE;
        break;
      case EDatabaseType.CLICKHOUSE:
        // 处理postgre
        this.app.externalSystemClient = new ClickHouse({
          protocol: option?.protocol,
          host: option?.host,
          port: option?.port,
          path: option?.path,
          format: "JSON",
          user: option?.user,
          password: option?.password,
          queryOptions: {
            database: option?.database,
          },
          ...(option?.ca
            ? {
                ca: option.ca,
                requestCert: true,
                rejectUnauthorized: false,
              }
            : {}),
        });
        this.type = EDatabaseType.CLICKHOUSE;
        break;
    }

    (global as any).app = {
      externalSystemClient: this.app.externalSystemClient as ExternalSystem,
    };
  };

  /**
   * 执行 SQL 查询语句
   * @param sql sql 语句
   * @returns 查询结果
   */
  executeSql = async (sql: string): Promise<any> => {
    // 处理错误
    try {
      const execDataRes = await this.ctx.app.externalSystemClient
        .querying<any>(sql)
        .catch((error) => {
          this.ctx?.throw(500, error);
        });

      if (this.type === EDatabaseType.CLICKHOUSE) {
        return execDataRes.data as IDatasetTable[];
      }
      return execDataRes as IDatasetTable[];
    } catch (error) {
      if (error?.code == "ECONNREFUSED") {
        this.ctx?.throw(500, "请检查数据库连接！");
      } else {
        this.ctx?.throw(500, error);
      }
    }
  };

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

  checkConnect = async () => {
    if (!this.type) return false;
    switch (this.type) {
      case EDatabaseType.CLICKHOUSE:
        try {
          await this.executeSql("SHOW TABLES LIKE 'system%';");
          return true;
        } catch (e) {
          return false;
        }
      case EDatabaseType.POSTGRE:
        try {
          await this.executeSql(
            "SELECT tablename as name FROM pg_catalog.pg_tables limit 1"
          );
          return true;
        } catch (e) {
          return false;
        }
      default:
        return false;
    }
  };
}
