import { Inject, Logger, Provide } from "@midwayjs/decorator";
import { RestApiService } from "./restApi";
import { EBIVERSION } from "@bi/common";
import { IMidwayLogger } from "@midwayjs/logger";

const isCms = process.env.BI_VERSION === EBIVERSION.CMS;

interface ISystemLogParams {
  level: string;
  category: string;
  component: string;
  content: string;
  source: string;
}

/** 操作来源 */
export enum ELogOperateSource {
  // 用户操作
  "USER",
  // 系统操作
  "SYSTEM",
}

/** 操作类型 */
export enum ELogOperareType {
  "UNKNOWN",
  "QUERY",
  "CREATE",
  "UPDATE",
  "DELETE",
  "BATCH_DELETE",
  "TIMER_TASK",
  "MANUAL_TASK",
  "IMPORT",
  "EXPORT",
}

/** 操作类型label */
const LogOperateLabel: Record<`${ELogOperareType}`, string> = {
  [ELogOperareType.UNKNOWN]: "",
  [ELogOperareType.QUERY]: "查询",
  [ELogOperareType.CREATE]: "创建",
  [ELogOperareType.UPDATE]: "编辑",
  [ELogOperareType.DELETE]: "删除",
  [ELogOperareType.BATCH_DELETE]: "批量删除",
  [ELogOperareType.TIMER_TASK]: "定时任务执行",
  [ELogOperareType.MANUAL_TASK]: "用户手动执行",
  [ELogOperareType.IMPORT]: "导入",
  [ELogOperareType.EXPORT]: "导出",
};

/** 操作对象 */
export enum ELogOperareTarget {
  "UNKNOWN",
  "DASHBOARD",
  "WIDGET",
  "DATASOURCE",
  "REPORT",
  "DATABASE"
}

/** 操作对象label */
const LogOperatetargetLabel: Record<`${ELogOperareTarget}`, string> = {
  [ELogOperareTarget.UNKNOWN]: "",
  [ELogOperareTarget.DASHBOARD]: "仪表盘",
  [ELogOperareTarget.WIDGET]: "图表",
  [ELogOperareTarget.DATASOURCE]: "数据源",
  [ELogOperareTarget.REPORT]: "报表",
  [ELogOperareTarget.DATABASE]: "数据库",
};

export interface ISystemLogWriteParams {
  // 操作来源
  source?: ELogOperateSource;
  // 操作类型
  type?: ELogOperareType;
  // 操作对象
  target?: ELogOperareTarget;
  // 内容
  content: string;
  // 地址
  address?: string;
  // 用户名
  username?: string;
}

/**
 * 向数据库内写入log数据
 * bi操作日志需要记录到audit用户下
 */
@Provide()
export class SystemLogService {
  @Inject()
  restapiService: RestApiService;

  @Logger()
  readonly logger: IMidwayLogger;

  /** 操作类型 */
  public static OperateType = {};

  private _generateCompleteSource({
    source,
    address,
    username,
  }: Pick<ISystemLogWriteParams, "address" | "username" | "source">) {
    if (source === ELogOperateSource.SYSTEM) return "系统操作";
    else if (source === ELogOperateSource.USER) {
      if (address && username) {
        return `${username}(${address})`;
      }
    }
    throw new Error("[系统日志]: 写入失败，日志来源生成失败!");
  }

  private _generateCompleteContent({
    type = ELogOperareType.UNKNOWN,
    target = ELogOperareTarget.UNKNOWN,
    content = "",
  }: Pick<ISystemLogWriteParams, "type" | "target" | "content">) {
    let complateContent = "";
    if (
      type === ELogOperareType.UNKNOWN ||
      target === ELogOperareTarget.UNKNOWN
    ) {
      return complateContent + content;
    }

    if (
      [
        ELogOperareType.QUERY,
        ELogOperareType.CREATE,
        ELogOperareType.UPDATE,
        ELogOperareType.DELETE,
      ].includes(type)
    ) {
      complateContent =
        `${LogOperateLabel[type]}${LogOperatetargetLabel[target]}` +
        complateContent;
    } else if (
      [ELogOperareType.TIMER_TASK, ELogOperareType.MANUAL_TASK].includes(type)
    ) {
      complateContent = `${LogOperateLabel[type]}` + complateContent;
    } else {
      complateContent =
        `${LogOperateLabel[type] || type}${
          LogOperatetargetLabel[target] || target
        }` + complateContent;
    }
    return `[${complateContent}] ${content}`;
  }

  public async write({
    source = ELogOperateSource.SYSTEM,
    type = ELogOperareType.UNKNOWN,
    target = ELogOperareTarget.UNKNOWN,
    content = "",
    address,
    username,
  }: ISystemLogWriteParams) {
    try {
      const params: ISystemLogParams = {
        level: "1",
        category: "101",
        component: "002001",
        content: this._generateCompleteContent({
          content,
          type,
          target,
        }),
        source: this._generateCompleteSource({ source, username, address }),
      };

      try {
        this.restapiService.post(
          isCms
            ? "/center/restapi/v1/system/logs"
            : "/manager/restapi/v1/system/logs",
          params
        );
      } catch (err) {
        this.logger.error(`系统日志写入失败，${err}`);
      }
    } catch (err) {
      console.warn(err);
    }
  }

  public loggerCreator({
    source,
    address,
    username,
  }: Pick<ISystemLogWriteParams, "source" | "address" | "username">) {
    return ({
      content,
      type,
      target,
    }: Omit<ISystemLogWriteParams, "source" | "address" | "username">) => {
      try {
        const params: ISystemLogParams = {
          level: "1",
          category: "101",
          component: "002001",
          content: this._generateCompleteContent({
            content,
            type,
            target,
          }),
          source: this._generateCompleteSource({ source, username, address }),
        };
        
        try {
          this.restapiService.post(
            isCms
              ? "/center/restapi/v1/system/logs"
              : "/manager/restapi/v1/system/logs",
            params
          );
        } catch (err) {
          this.logger.error(`系统日志写入失败，${err}`);
        }
      } catch (err) {
        console.warn(err);
      }
    };
  }
}
