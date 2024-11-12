import { PowerPartial } from "egg";
import { EggAppConfig } from "../../typings/app";
import * as https from "https";

/** Clickhouse 配置 */
export interface IExternalOptions extends https.RequestOptions {
  protocol: "https:" | "http:";
  port: number;
  host: string;
  user?: string;
  password?: string;
  database: string;
  ca_path?: string;
}

/** JWT 配置 */
export interface IJwtConfig {
  /** 是否启用 */
  enabled?: boolean;
  /** 密钥 */
  secret: string;
  /**
   * 有效时间
   * @see https://github.com/vercel/ms
   *  */
  expiresIn: string;
}

/**
 * 自定义的 APP config 配置
 */
export interface IMyAppConfig extends PowerPartial<EggAppConfig> {
  /**
   * 部署模式
   * @param single 单机部署
   * @param embed 内嵌部署，当做其他应用的组件
   */
  isDev: boolean,
  mode: "single" | "embed";
  /** 定时报表保存路径 */
  report: {
    pdf_dir: string;
  };
  /** 初始化仪表盘保存路径 */
  init: {
    dashboard: string;
    widget: string;
  };
  /** 初始化dictmapping */
  dict: {
    mapping: string;
  };
  /**
   * 外发邮箱配置
   * @description 单机部署时可用，内嵌部署时不会使用此参数
   */
  mail_opts: {
    // 显示名称
    display_name: string;
    host: string;
    port: number;
    auth: {
      // 登录名称
      user: string;
      // 登录密码
      pass: string;
    };
    // 是否加密发送
    secure: boolean;
  };

  /** 前端页面的地址 */
  web_uri: string;
  /** 共享文件地址 */
  asset_uri: string
  // npmd
  restapi: {
    url_origin: string;
    app_key: string;
    app_token: string;
  };

  backgrounds: string,
  bi_mode: "main" | "11j";
}
