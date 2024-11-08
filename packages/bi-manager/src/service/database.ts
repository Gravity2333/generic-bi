import { ALL, App, Config, Inject, Logger, Provide } from "@midwayjs/decorator";
import { Context } from "egg";
import { IMidwayLogger } from "@midwayjs/logger";
import { IMyAppConfig } from "../interface";
import DatabaseModel from "../model/database";
import { CreateDatabseInput, UpdateDatabseInput } from "../dto/database.dto";
import { EDatabaseType, ExternalSystem, IDatasetTable } from "@bi/common";
import { Application } from "@midwayjs/web";
import { postgrePlugin } from "../plugins/postgrePlugin";
import { clickhousePlugin } from "../plugins/clickhousePlugin";
import { mysqlPlugin } from "../plugins/mysqlPlugins";

type ParsedDBConfig = {
  id: string;
  type: EDatabaseType;
  option: Record<string, any>;
};
@Provide()
export class DatabaseService {
  @Inject()
  ctx: Context;

  @Logger()
  readonly logger: IMidwayLogger;

  @Config(ALL)
  config: IMyAppConfig;

  @App()
  app: Application;

  async getDatabases(): Promise<DatabaseModel[]> {
    const { rows } = await DatabaseModel.findAndCountAll();
    return rows;
  }

  async getDatabaseById(id): Promise<DatabaseModel> {
    const row = await DatabaseModel.findByPk(id);
    if (!row) {
      this.ctx?.throw(404, "数据库配置信息未找到！");
    }
    return row;
  }

  private _parseDatabseInput = (databaseConfig: UpdateDatabseInput) => {
    return {
      id: databaseConfig.id,
      type: databaseConfig.type as EDatabaseType,
      option: JSON.parse(databaseConfig.option || "{}"),
    };
  };

  private _handleDBInit = (
    externalSystemClient: Record<string, ExternalSystem>,
    databaseConfig: ParsedDBConfig
  ) => {
    const { type, option, id } = databaseConfig;
    let client = null;
    switch (type) {
      case EDatabaseType.POSTGRE:
        client = postgrePlugin(option)
        break;
      case EDatabaseType.CLICKHOUSE:
        client = clickhousePlugin(option)
        break;
      case EDatabaseType.MYSQL:
        client = mysqlPlugin(option)
        break;
    }
    externalSystemClient[id] = client;
  };

  /** 增加数据库实例 */
  private _addAndCoverDatabaseInstance = async (
    id: string,
    databaseConfig: ParsedDBConfig
  ) => {
    console.log(this.app.externalSystemClient,id,databaseConfig)
    if (!this.app.externalSystemClient) {
      this.app.externalSystemClient = {};
      (global as any).app = {
        externalSystemClient: this.app.externalSystemClient as ExternalSystem,
      };
    }
    this._handleDBInit(
      this.app.externalSystemClient,
      databaseConfig
    );
  };

  /** 删除数据库实例 */
  private _removeDatabaseInastance = async (id: string) => {
    if (!this.app.externalSystemClient) {
      this.app.externalSystemClient = {};
      (global as any).app = {
        externalSystemClient: this.app.externalSystemClient as ExternalSystem,
      };
    }
    delete this.app.externalSystemClient[id];
  };

  /** 获取解析后的DB信息 */
  private async _getParsedInfos(): Promise<ParsedDBConfig[]> {
    const { rows } = await DatabaseModel.findAndCountAll();

    return rows.map((row) => ({
      id: row.id,
      type: row.type as EDatabaseType,
      option: JSON.parse(row.option || "{}"),
    }));
  }

  /** 创建DB */
  async createDatabse(databaseConfig: CreateDatabseInput) {
    const createdDBConfig = await DatabaseModel.create(databaseConfig as any);
    return this._addAndCoverDatabaseInstance(
      createdDBConfig.id,
      this._parseDatabseInput(createdDBConfig)
    );
  }

  /** 更新DB */
  async updateDatabase(databaseConfig: UpdateDatabseInput) {
    const id = databaseConfig.id;
    if (databaseConfig.id) {
      const target = await DatabaseModel.findByPk(id);
      if (!target) {
        this.ctx?.throw(404, "数据库配置未找到！");
      }
      await target.update(databaseConfig);
      return this._addAndCoverDatabaseInstance(
        databaseConfig.id,
        this._parseDatabseInput(databaseConfig)
      );
    }
  }

  /** 删除DB */
  async deleteDatabase(id: string) {
    const target = await DatabaseModel.findByPk(id);
    if (!target) {
      this.ctx?.throw(404, "数据库配置未找到！");
    }
    await target.destroy();
    return this._removeDatabaseInastance(id);
  }

  /** 初始化数据库中已经有的配置 */
  initDatabaseInstance = async () => {
    // 初始化 外部系统 客户端
    // =======================
    const databaseConfigs = await this._getParsedInfos();
    this.app.externalSystemClient = {};
    databaseConfigs.forEach(
      this._handleDBInit.bind(this, this.app.externalSystemClient)
    );

    (global as any).app = {
      externalSystemClient: this.app.externalSystemClient as ExternalSystem,
    };
  };

  /**
   * 执行 SQL 查询语句
   * @param sql sql 语句
   * @returns 查询结果
   */
  executeSql = async (sql: string|Record<string, string>, databaseId: string): Promise<any> => {
    // 处理错误
    try {
      const DBInstance = this.ctx.app.externalSystemClient[databaseId];
      if (!DBInstance || !DBInstance.querying) {
        this.ctx?.throw(500, "数据库实例不存在！");
      }

      const execSql = typeof sql === 'object'?sql[DBInstance.type]:sql
      if(!execSql){
        this.ctx?.throw(500, "SQL对应查询数据库错误！");
      }
  
      const execDataRes = await DBInstance.querying<any>(execSql).catch((error) => {
        this.ctx?.throw(500, error);
      });
     

      if (DBInstance.type === EDatabaseType.CLICKHOUSE) {
        return execDataRes.data as IDatasetTable[];
      } else if (DBInstance.type === EDatabaseType.POSTGRE) {
        return execDataRes as IDatasetTable[];
      }else if(DBInstance.type === EDatabaseType.MYSQL){
        return execDataRes as IDatasetTable[];
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
    // if (!this.type) return false;
    // switch (this.type) {
    //   case EDatabaseType.CLICKHOUSE:
    //     try {
    //       // await this.executeSql("SHOW TABLES LIKE 'system%';");
    //       return true;
    //     } catch (e) {
    //       return false;
    //     }
    //   case EDatabaseType.POSTGRE:
    //     try {
    //       // await this.executeSql(
    //       //   "SELECT tablename as name FROM pg_catalog.pg_tables limit 1"
    //       // );
    //       return true;
    //     } catch (e) {
    //       return false;
    //     }
    //   default:
    //     return false;
    // }
  };
}
