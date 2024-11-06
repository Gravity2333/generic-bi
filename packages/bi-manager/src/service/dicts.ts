import {
  INpmdDict,
} from "@bi/common";
import { HttpService } from "@midwayjs/axios";
import { Config, Inject, Logger, Provide } from "@midwayjs/decorator";
import { IMidwayLogger } from "@midwayjs/logger";
import { RedisService } from "@midwayjs/redis";
import { IMyAppConfig } from "../interface/config";
import { RestApiService } from "./restApi";

/** 字典信息缓存， 10分钟更新一次 */
// const dictInfoCache = new TimerCache(600000);


export const NPMD_DICT_CACHE_KEY = "npmd_dict";
export const NPMD_CMS_TABLE = "npmd-cms";

@Provide()
export class NpmdDictService {
  @Logger()
  readonly logger: IMidwayLogger;

  @Inject()
  redisService: RedisService;

  @Inject()
  httpService: HttpService;

  @Inject()
  restapiService: RestApiService;

  @Config("restapi")
  restapiConfig: IMyAppConfig["restapi"];

  /**
   * 获取 NPMD 中的字典数据
   * @param forceFlush 是否强制刷新
   * @returns 字典数据
   */
  async queryDicts(forceFlush: boolean = false) {
    // 未开启强制刷新时，先查询缓存
    // 移除缓存
    // if (!forceFlush) {
    //   const cacheString = await this.redisService.get(NPMD_DICT_CACHE_KEY);
    //   if (cacheString) {
    //     return parseArrayJson<INpmdDict>(cacheString);
    //   }
    // }

    const dict: INpmdDict[] = [];  
    // dict.push({
    //   id: "geo_continent",
    //   name: NPMD_DICT_FLEID_MAP["geo_continent"],
    //   dict: allContinentMap,
    // });
   
    return dict;
  }
}
