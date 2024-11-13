import * as jwt from "jsonwebtoken";

export * from "./config";
export * from "./schedule";

export interface IJwtPayload extends jwt.JwtPayload {
  user_id: string;
  user_name: string;
}

/** String 表示 Boolean */
export enum EBooleanString {
  True = "1",
  False = "0",
}

/** 定时报表定时计划生成的文件 */
export interface IReportJobFile {
  fileContent: Buffer;
  filename: string;
  filePath?: string;
}

// @see https://midwayjs.org/docs/eggjs#%E5%A2%9E%E5%8A%A0%E6%89%A9%E5%B1%95%E5%AE%9A%E4%B9%89
declare module "egg" {
  // 扩展 Application
  interface Application {}

  // 扩展 Context
  interface Context {
    user: IJwtPayload;
  }
}
