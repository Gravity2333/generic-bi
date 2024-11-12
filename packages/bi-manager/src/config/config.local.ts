import { EggAppInfo } from "egg";
import { join } from "path";
import type {  IMyAppConfig } from "../interface";

/** 本地服务链接的服务器地址 */
const LOCAL_HOST = "127.0.0.1";

export default (appInfo: EggAppInfo) => {
  const config = {} as IMyAppConfig;

  config.isDev = true;
  config.mode = "embed";

  config.backgrounds = join(__dirname, "../app/resources/backgrounds")

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
      port: 6379, // default value
      // password: "Machloop@123",
      db: 0,
    },
  };

  config.sequelize = {
    options: {
      dialect: "postgres",
      host: LOCAL_HOST,
      port: 5432,
      database: "bi",
      user: "genericbiserver",
      username: "genericbiserver",
      password: "genericbiserver@123",
      timezone: "+08:00",
      modules: ["../model/*"],
      logging: false,
      pool: {
        handleDisconnects: true,
        max: 100,
        min: 0,
        idle: 10000,
        acquire: 30000, // i also tried 50000
      },
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
  config.asset_uri = "http://127.0.0.1:7001/public";
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
  config.bi_mode = "main";

  config.static = {
    prefix: "/public/",
    dir: join(appInfo.baseDir, "app")
  };

  return config;
};
