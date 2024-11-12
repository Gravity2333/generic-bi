import { Inject, Provide, Scope, ScopeEnum } from "@midwayjs/decorator";
import { RedisService } from "@midwayjs/redis";
import { IRedisLock, IReportScheduleMap } from "../interface";

/**
 * 生成分页参数
 * @param pageNumber 每页多少条记录
 * @param pageSize 当前页码
 * @returns 分页数据
 */
export function getPagination(pageNumber: number, pageSize: number) {
  return {
    offset: pageNumber * pageSize,
    limit: pageSize,
    pageSize: pageSize,
    pageNumber: pageNumber,
  };
}

export interface IDashboardSeqService {
  set: (ids: string) => void;
  get: () => Promise<string>;
}

export interface ISqlJsonSeqService {
  set: (ids: string) => void;
  get: () => Promise<string>;
}

export interface IJwtTimeoutService {
  set: (timeout: number) => void;
  get: () => Promise<number>;
}

export interface ISysTitleService {
  set: (title: string) => void;
  get: () => Promise<string>;
}

export interface IDefaultBackgroundPathService {
  set: (path: string) => void;
  get: () => Promise<string>;
}

/**
 * 编码成 Base64
 * @param str 字符串
 * @returns
 */
export function base64Encode(str: string): string {
  return Buffer.from(str).toString("base64");
}

const RED_LOCK = Symbol("Utils#redlock");
const SCHEDULE_JOB_MAP = Symbol("Utils#scheduleJobMap");
const DASHBOARD_SEQ_MAP = Symbol("Utils#dashbroadSeqMap");
const SQL_JSON_SEQ_MAP = Symbol("Utils#sqlJsonSeqMap");
const JWT_TIMEOUT_MAP = Symbol("Utils#jwtTimeoutMap");
const SYS_TITLE_MAP = Symbol("Utils#SysTitleMap");
const DEFAULT_BACKGROUND_PATH_MAP = Symbol("Utils#DefaultBackgroundPathMap");
@Provide()
@Scope(ScopeEnum.Singleton)
export class Utils {
  @Inject()
  redisService: RedisService;

  /**
   * Redis 锁
   * @returns
   */
  get redisRedlock(): IRedisLock {
    if (!this[RED_LOCK]) {
      this[RED_LOCK] = <IRedisLock>{};
      this[RED_LOCK].lock = async (key, value, ttl = 60) => {
        return await this.redisService.set(key, value, "EX", ttl, "NX");
      };
      this[RED_LOCK].unlock = async (key) => {
        return await this.redisService.del(key);
      };
    }
    return this[RED_LOCK];
  }

  /**
   * 用于存放定时任务的对象
   */
  get scheduleJobMap(): IReportScheduleMap {
    if (!this[SCHEDULE_JOB_MAP]) {
      this[SCHEDULE_JOB_MAP] = new Map();
    }
    return this[SCHEDULE_JOB_MAP];
  }

  /** 用于存放仪表盘顺序 */
  get dashbroadSeqService(): IDashboardSeqService {
    if (!this[DASHBOARD_SEQ_MAP]) {
      this[DASHBOARD_SEQ_MAP] = {};
      this[DASHBOARD_SEQ_MAP].set = (ids) => {
        this.redisService.set(DASHBOARD_SEQ_MAP as any, ids);
      };
      this[DASHBOARD_SEQ_MAP].get = async () => {
        return (await this.redisService.get(DASHBOARD_SEQ_MAP as any)) || "";
      };
    }
    return this[DASHBOARD_SEQ_MAP];
  }

  /** 用于存放sql-json顺序 */
  get sqlJsonSeqService(): ISqlJsonSeqService {
    if (!this[SQL_JSON_SEQ_MAP]) {
      this[SQL_JSON_SEQ_MAP] = {};
      this[SQL_JSON_SEQ_MAP].set = (ids) => {
        this.redisService.set(SQL_JSON_SEQ_MAP as any, ids);
      };
      this[SQL_JSON_SEQ_MAP].get = async () => {
        return (await this.redisService.get(SQL_JSON_SEQ_MAP as any)) || "";
      };
    }
    return this[SQL_JSON_SEQ_MAP];
  }

  /** jwt过期时间 */
  get jwtTimeoutService(): IJwtTimeoutService {
    if (!this[JWT_TIMEOUT_MAP]) {
      this[JWT_TIMEOUT_MAP] = {};
      this[JWT_TIMEOUT_MAP].set = (timeout) => {
        this.redisService.set(JWT_TIMEOUT_MAP as any, timeout);
      };
      this[JWT_TIMEOUT_MAP].get = async () => {
        return (await this.redisService.get(JWT_TIMEOUT_MAP as any)) || "";
      };
    }
    return this[JWT_TIMEOUT_MAP];
  }

  /** 系统标题 */
  get sysTitleService(): ISysTitleService {
    if (!this[SYS_TITLE_MAP]) {
      this[SYS_TITLE_MAP] = {};
      this[SYS_TITLE_MAP].set = (title) => {
        this.redisService.set(SYS_TITLE_MAP as any, title);
      };
      this[SYS_TITLE_MAP].get = async () => {
        return (await this.redisService.get(SYS_TITLE_MAP as any)) || "";
      };
    }
    return this[SYS_TITLE_MAP];
  }

  /** 背景 */
get defaultBackgroundPathService(): IDefaultBackgroundPathService {
  if (!this[DEFAULT_BACKGROUND_PATH_MAP]) {
    this[DEFAULT_BACKGROUND_PATH_MAP] = {};
    this[DEFAULT_BACKGROUND_PATH_MAP].set = (title) => {
      this.redisService.set(DEFAULT_BACKGROUND_PATH_MAP as any, title);
    };
    this[DEFAULT_BACKGROUND_PATH_MAP].get = async () => {
      return (await this.redisService.get(DEFAULT_BACKGROUND_PATH_MAP as any)) || "";
    };
  }
  return this[DEFAULT_BACKGROUND_PATH_MAP];
}
}


export const formatTime = function (fmt, date) {
  var o = {
    "M+": date.getMonth() + 1, // 月份
    "d+": date.getDate(), // 日
    "h+": date.getHours(), // 小时
    "m+": date.getMinutes(), // 分
    "s+": date.getSeconds(), // 秒
    "q+": Math.floor((date.getMonth() + 3) / 3), // 季度
    S: date.getMilliseconds(), // 毫秒
  };
  if (/(y+)/.test(fmt))
    fmt = fmt.replace(
      RegExp.$1,
      (date.getFullYear() + "").substr(4 - RegExp.$1.length)
    );
  for (var k in o)
    if (new RegExp("(" + k + ")").test(fmt))
      fmt = fmt.replace(
        RegExp.$1,
        RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length)
      );
  return fmt;
};

/** 下载图表为EXCEL */
export async function downloadWidgetExcel(
  params: {
    sheetName: string;
    titleNameList: string[];
    dataList: any[][];
  }[]
) {
  const xlsx = require("node-xlsx");
  const list = params.map((p) => {
    return {
      name: p.sheetName,
      data: [p.titleNameList, ...(p.dataList || [])],
    };
  });

  const buffer = xlsx.build(list);
  return buffer;
}

/** 下载图表为CSV */
export function downloadWidgetCSV({
  titleNameList,
  dataList,
}: {
  titleNameList: string[];
  dataList: Record<string, any>[];
}) {
  const Json2csvParser = require("json2csv").Parser;
  const json2csvParser = new Json2csvParser({
    fields: titleNameList,
  });

  const csv = json2csvParser.parse(dataList);

  return "\ufeff" + csv;
}
