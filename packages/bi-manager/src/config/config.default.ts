import { EggAppInfo } from "egg";
import * as path from "path";
import { IMyAppConfig } from "./../interface/config";

// const HOST = "127.0.0.1";

export default (appInfo: EggAppInfo) => {
  const config = {} as IMyAppConfig;

  config.cluster = {
    listen: {
      path: "",
      port: 41130,
      hostname: "127.0.0.1",
    },
  };

  config.name = "自助BI系统";

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + "_{{keys}}";

  // https://www.midwayjs.org/docs/2.0.0/eggjs#%E6%9C%8D%E5%8A%A1%E5%99%A8%E6%97%A5%E5%BF%97
  config.logrotator = {
    maxDays: 5,
  };

  // add your config here
  config.middleware = [
    "prefixMiddleware",
    "errorHandlerMiddleware",
    "jwtAuthMiddleware",
    "responseMiddleware",
    "sysLoggerMiddleware"
  ];

  config.sequelize = {
    options: {
      dialect: "postgres",
      host: "127.0.0.1",
      port: 5433,
      database: "bi",
      username: "postgres",
      password: "bi@123",
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

  config.redis = {
    client: {
      host: "bi-redis", // default value
      port: 6379, // default value
      // password: "Machloop@123",
      db: 0,
    },
  };

  config.security = {
    csrf: false,
  };

  config.static = {
    prefix: "/bi/web-static/",
  };

  config.view = {
    defaultViewEngine: "ejs",
    mapping: {
      ".html": "ejs",
    },
  };

  config.report = {
    pdf_dir: path.join(__dirname, "../resources/pdf"),
  };

  config.init = {
    dashboard: path.join(__dirname, "../init/dashboard"),
    widget: path.join(__dirname, "../init/widget"),
  };

  config.dict = {
    mapping: path.join(__dirname, "../init/sql"),
  };

  // 邮箱配置
  config.mail_opts = {
    display_name: "bi_system",
    host: "smtp.exmail.qq.com",
    // host: "smtp.qq.com",
    port: 465,
    /** 请填写默认邮件配置 */
    auth: {
      user: "liuze@machloop.com",
      pass: "B49zqJUgg3VMfJu8",
    },
    secure: true,
  };

  config.web_uri = "http://127.0.0.1:41130/bi";

  config.jwt = {
    enabled: false,
    secret: "1024@Machloop@1024",
    expiresIn: "2h", // https://github.com/vercel/ms
  };

  // config.clickhouse = {
  //   protocol: "http:",
  //   host: HOST,
  //   path: "/",
  //   port: 8123,
  //   user: "clickhouse",
  //   password: "Machloop@123",
  //   database: "fpc",
  //   // ca_path: join(__dirname, "./ch_config/certs/server.crt"),
  // };

  // config.clickhouse = {
  //   protocol: "http:",
  //   host: HOST,
  //   path: "/",
  //   port: 8123,
  //   user: "clickhouse",
  //   password: "Machloop@123",
  //   database: "fpc",
  //   // ca_path: join(__dirname, "./ch_config/certs/server.crt"),
  // };

  // config.restapi = {
  //   url_origin: `https://${NPM_CMS_HOST}:${isCms ? 41120 : 41110}`,
  //   app_key: "td-XPsGtzCZQnkmhNNGn_jsec7cb8e_R",
  //   app_token: "yRKcxHQYeMJFdyHHB@pCJtDPjXjsys-D",
  // };

  /** 配置日志清理 */
  config.midwayLogger = {
    default: {
      maxFiles: "10d",
    },
  };

  /** 版本
   *  11局 - 11J
   *  主线 - MAIN
   */
  config.bi_mode = "main";

  return config;
};
