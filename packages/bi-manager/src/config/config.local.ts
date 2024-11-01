import { EggAppInfo } from "egg";
import { join } from "path";
import type { IClickhouseConfig, IMyAppConfig } from "../interface";
import { EBIVERSION} from "@bi/common";

const isCms = process.env.BI_VERSION === EBIVERSION.CMS;
/** 本地服务链接的服务器地址 */
const LOCAL_HOST = "10.0.108.7";

export default (appInfo: EggAppInfo) => {
  const config = {} as IMyAppConfig;

  config.isDev = true
  config.mode = "embed";

  config.orm = {
    "npmd-cms": {
      type: "postgres",
      host: LOCAL_HOST,
      port: 5432,
      username: "machloop",
      password: "Machloop@123",
      timezone: "+08:00",
      database: isCms ? "fpc-cms" : "fpc",
    },
  };

  if (isCms) {
    config.clickhouse = {
      protocol: "http:",
      host: LOCAL_HOST,
      path: "/clickhouse/",
      port: 8123,
      user: "clickhouse",
      password: "Machloop@123",
      database: "fpc",
      ca_path: join(__dirname, "./ch_config/certs/server.crt"),
    } as IClickhouseConfig;
  } else {
    config.clickhouse = {
      protocol: "https:",
      host: LOCAL_HOST,
      path: "/clickhouse/",
      port: 443,
      user: "clickhouse",
      password: "Machloop@123",
      database: "fpc",
      ca_path: join(__dirname, "./ch_config/certs/server.crt"),
    } as IClickhouseConfig;

    config.chStatus = {
      protocol: "http:",
      host: LOCAL_HOST,
      path: "/",
      port: 8124,
      user: "clickhouse",
      password: "Machloop@123",
      database: "fpc",
      // ca_path: join(__dirname, "./ch_config/certs/server.crt"),
    };
  }

  config.report = {
    pdf_dir: join(__dirname, "../app/resources/pdf/"),
  };

  config.init = {
    dashboard: join(__dirname, "../app/init/dashboard/"),
    widget: join(__dirname, "../app/init/widget/"),
  };

  config.dict = {
    mapping: join(__dirname, "../app/init/sql/"),
  };

  config.redis = {
    client: {
      host: LOCAL_HOST, // default value
      port: 6380, // default value
      password: "Machloop@123",
      db: 0,
    },
  };

  config.sequelize = {
    options: {
      dialect: "postgres",
      host: LOCAL_HOST,
      port: 5433,
      database: "bi",
      username: "machloop",
      password: "Machloop@123",
      timezone: "+08:00",
      modules: ["../model/*"],
      define: {
        paranoid: true, // 假删除
        freezeTableName: true, // 固定表名
        underscored: true,
        // @see: https://github.com/sequelize/sequelize/issues/10857
        timestamps: true,
      },
    },
  };

  config.web_uri = "http://127.0.0.1:8000/bi";

  config.jwt = {
    enabled: false,
    secret: "1024@Machloop@1024",
    expiresIn: "2h", // https://github.com/vercel/ms
  };

  config.restapi = {
    url_origin: `http://${LOCAL_HOST}:${isCms ? 41120 : 41110}`,
    app_key: "td-XPsGtzCZQnkmhNNGn_jsec7cb8e_R",
    app_token: "yRKcxHQYeMJFdyHHB@pCJtDPjXjsys-D",
  };

  /** 配置日志清理 */
  config.midwayLogger = {
    default: {
      maxFiles: "10d",
    },
  };

  /** 版本
   *  11局 - 11j
   *  主线 - main
   */
  config.bi_mode = 'main';

  return config;
};
