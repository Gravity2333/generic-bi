/**
 * 邮箱配置
 */
export interface IMailConfig {
  /** 邮箱 host 地址 */
  host: string;
  /** 端口 */
  port: number;
  /** 邮箱地址 */
  mail_address: string;
  /** 显示名称 */
  mail_username: string;
  /** 邮箱登录用户 */
  login_user: string;
  /** 邮箱登录密码 */
  login_password: string;
  /** 是否加密发送 */
  secure: boolean;
  /** 是否是有效的配置 */
  effective: boolean;
}
