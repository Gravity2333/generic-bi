import IORedis = require("ioredis");
import * as schedule from "node-schedule";

/**
 * 本地缓存的定时报表的 job
 *
 * ```Map<ReportId, Job>```
 */
export type IReportScheduleMap = Map<string, schedule.Job>;

// redis 锁
export interface IRedisLock {
  lock: (
    key: IORedis.KeyType,
    value: IORedis.ValueType,
    ttl?: number
  ) => Promise<"OK">;
  unlock: (key: IORedis.KeyType) => Promise<number>;
}
