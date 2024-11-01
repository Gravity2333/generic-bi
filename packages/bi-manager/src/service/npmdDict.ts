import {
  EApplicationType,
  EAssetType,
  EBIVERSION,
  ECustomTimeType,
  EDhcpV4MessageType,
  EDhcpV6MessageType,
  EEthernetType,
  EFlowLogEthProtocol,
  EHttpAnalysisType,
  EIcmpVersion,
  EIpAddressLocality,
  EMailLoginStatus,
  enum2Map,
  EProtocolMailInstruct,
  ICustomTime,
  // ICustomTime,
  ILogicalSubnet,
  INetwork,
  INetworkGroup,
  INpmdDict,
  INpmdDictValueEnum,
  IP_PROTOCOL_MAP,
  NPMD_DICT_FLEID_MAP,
  OS_VERSION_MAP,
  PARTITION_NAME_DICT,
  PROTOCOL_DNS_TYPE_DICT,
} from "@bi/common";
import { HttpService } from "@midwayjs/axios";
import { Config, Inject, Logger, Provide } from "@midwayjs/decorator";
import { IMidwayLogger } from "@midwayjs/logger";
import { InjectEntityModel } from "@midwayjs/orm";
import { RedisService } from "@midwayjs/redis";
import { Repository } from "typeorm";
import { NpmdCmsCustomGeoCountry } from "../entity/npmd-cms/customGeoCountry";
import { NpmdCmsCustomSaApplication } from "../entity/npmd-cms/customSaApplication";
import { NpmdCmsHostGroup } from "../entity/npmd-cms/hostGroup";
import { NpmdCmsCentral } from "../entity/npmd-cms/network";
import { NpmdCmsCustomSaCategory } from "../entity/npmd-cms/saCustomCategory";
import { NpmdCmsCustomSaSubcategory } from "../entity/npmd-cms/saCustomSubcategory";
import { NpmdCmsService as NpmdApplianceService } from "../entity/npmd-cms/service";
import { NpmdCmsSmtp } from "../entity/npmd-cms/smtp";
import { EBooleanString } from "../interface";
import {
  INpmdRestAPiApplication,
  INpmdRestAPiGeo,
  INpmdRestAPiL7Protocol,
} from "../interface/npmd";
import { IMyAppConfig } from "./../interface/config";
import { stringify } from "qs";
import { NpmdCmsPolicy } from "../entity/npmd-cms/policy";
import { NetworkService } from "./network";
import { NpmdCmsCustomTimes } from "../entity/npmd-cms/customTimes";
import { NpmdCustomTimes } from "../entity/npmd/customTimes";
import { RestApiService } from "./restApi";
import { TimerCache } from "../utils/timerCache";

const isCms = process.env.BI_VERSION === EBIVERSION.CMS;
/** 字典信息缓存， 10分钟更新一次 */
const dictInfoCache = new TimerCache(600000);
/** 拼接生成名字 */
const generateName = (name: string, deleted?: EBooleanString): string => {
  return deleted == EBooleanString.True ? `${name}[已删除]` : name;
};

/** 网络信息 定时更新 */
export const NPMD_NETWORK_INFO: {
  networks: INetwork[];
  logicalSubnets: ILogicalSubnet[];
  networkGroups: INetworkGroup[];
} = {
  networks: [],
  logicalSubnets: [],
  networkGroups: [],
};

export const NPMD_DICT_CACHE_KEY = "npmd_dict";
export const NPMD_CMS_TABLE = "npmd-cms";

@Provide()
export class NpmdDictService {
  @Logger()
  readonly logger: IMidwayLogger;

  @Inject()
  redisService: RedisService;

  @Inject()
  networkService: NetworkService;

  @InjectEntityModel(NpmdCmsCentral, NPMD_CMS_TABLE)
  npmdCentralModel: Repository<NpmdCmsCentral>;

  @InjectEntityModel(NpmdCmsHostGroup, NPMD_CMS_TABLE)
  npmdHostGroupModel: Repository<NpmdCmsHostGroup>;

  @InjectEntityModel(NpmdApplianceService, NPMD_CMS_TABLE)
  npmdApplianceServiceModel: Repository<NpmdApplianceService>;

  @InjectEntityModel(NpmdCmsPolicy, NPMD_CMS_TABLE)
  npmdPolicyModel: Repository<NpmdCmsPolicy>;

  @InjectEntityModel(NpmdCmsCustomSaCategory, NPMD_CMS_TABLE)
  npmdCustomSaCategoryModel: Repository<NpmdCmsCustomSaCategory>;

  @InjectEntityModel(NpmdCmsCustomSaSubcategory, NPMD_CMS_TABLE)
  npmdCustomSaSubcategoryModel: Repository<NpmdCmsCustomSaSubcategory>;

  @InjectEntityModel(NpmdCmsCustomSaApplication, NPMD_CMS_TABLE)
  npmdCustomSaApplicationModel: Repository<NpmdCmsCustomSaApplication>;

  @InjectEntityModel(NpmdCmsCustomGeoCountry, NPMD_CMS_TABLE)
  npmdCustomGeoCountryModel: Repository<NpmdCmsCustomGeoCountry>;

  @InjectEntityModel(NpmdCmsSmtp, NPMD_CMS_TABLE)
  npmdCmsSmtpModel: Repository<NpmdCmsSmtp>;

  @InjectEntityModel(NpmdCmsCustomTimes, "npmd-cms")
  npmdCmsCustomTimesModel: Repository<NpmdCmsCustomTimes>;

  @InjectEntityModel(NpmdCustomTimes, "npmd-cms")
  npmdCustomTimesModel: Repository<NpmdCustomTimes>;

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

    const mapFilter = (map: Record<string, string>) => {
      Object.keys(map).forEach((key) => {
        if (!map[key] || (map[key] && map[key].includes("[已删除]"))) {
          delete map[key];
        }
      });
    };

    const dict: INpmdDict[] = [];

    // 获取网络
    let networkMap = {};
    try {
      networkMap = {
        ...(await this.networkService.listAllNetworks()),
        ...(await this.networkService.listAllNetworkGroups()),
      };
    } catch (error) {
      this.logger.error("[npmd-dict] query network error: ", error);
    }

    dict.push({
      id: "network",
      name: NPMD_DICT_FLEID_MAP["network"],
      dict: {
        ...networkMap,
        // ...networkGroupMap,
      },
    });

    // 获取业务
    let serviceMap = {};
    try {
      serviceMap = await this.listAllServices();
    } catch (error) {
      this.logger.error("[npmd-dict] query service error: ", error);
    }
    mapFilter(serviceMap);
    dict.push({
      id: "service",
      name: NPMD_DICT_FLEID_MAP["service"],
      dict: serviceMap,
    });

    // 获取策略
    let policyMap = {};
    try {
      policyMap = await this.listAllPolicies();
    } catch (error) {
      this.logger.error("[npmd-dict] query policy error: ", error);
    }
    mapFilter(policyMap);
    dict.push({
      id: "policy",
      name: NPMD_DICT_FLEID_MAP["policy"],
      dict: policyMap,
    });

    // 获取 IP地址组
    let hostGroupMap = {};
    try {
      hostGroupMap = await this.listAllHostGroups();
    } catch (error) {
      this.logger.error("[npmd-dict] query host_group error: ", error);
    }

    mapFilter(hostGroupMap);

    dict.push({
      id: "host_group",
      name: NPMD_DICT_FLEID_MAP["host_group"],
      dict: hostGroupMap,
    });

    // 解析 SA Start
    // =============================
    // 全部的分类
    let allSaCategoryMap = <INpmdDictValueEnum>{};
    // 全部的子分类
    let allSaSubCategoryMap = <INpmdDictValueEnum>{};
    // 全部的应用
    let allSaApplicationMap = <INpmdDictValueEnum>{};

    try {
      const { applicationMap, subCategoryMap, categoryMap } =
        await this.parseNpmdApplicationsFromRestApi();

      allSaCategoryMap = { ...allSaCategoryMap, ...categoryMap };
      allSaSubCategoryMap = { ...allSaSubCategoryMap, ...subCategoryMap };
      allSaApplicationMap = { ...allSaApplicationMap, ...applicationMap };
    } catch (error) {
      this.logger.error(
        "[npmd-dict] parse npmd sa application from restapi error: ",
        error
      );
    }

    // 解析内置的 SA
    // try {
    //   const { categoryList, subCategoryList, applicationList } =
    //     parseSaKnowledges();

    //   categoryList.forEach((el) => {
    //     allSaCategoryMap[el.categoryId] = el.nameText;
    //   });
    //   subCategoryList.forEach((el) => {
    //     allSaSubCategoryMap[el.subCategoryId] = el.nameText;
    //   });
    //   applicationList.forEach((el) => {
    //     allSaApplicationMap[el.applicationId] = el.nameText;
    //   });
    // } catch (error) {
    //   this.logger.error("[npmd-dict] query sa knowledge error: ", error);
    // }

    // 获取 sa 分类
    try {
      const customSaCategoryMap = await this.listAllCustomSaCategories();
      allSaCategoryMap = { ...allSaCategoryMap, ...customSaCategoryMap };
    } catch (error) {
      this.logger.error("[npmd-dict] query custom sa category error: ", error);
    }

    mapFilter(allSaCategoryMap);

    dict.push({
      id: "sa_category",
      name: NPMD_DICT_FLEID_MAP["sa_category"],
      dict: allSaCategoryMap,
    });

    // 获取 sa 子分类
    try {
      const customSaSubCategoryMap = await this.listAllCustomSaSubCategories();
      allSaSubCategoryMap = {
        ...allSaSubCategoryMap,
        ...customSaSubCategoryMap,
      };
    } catch (error) {
      this.logger.error(
        "[npmd-dict] query custom sa sub category error: ",
        error
      );
    }

    mapFilter(allSaSubCategoryMap);
    dict.push({
      id: "sa_sub_category",
      name: NPMD_DICT_FLEID_MAP["sa_sub_category"],
      dict: allSaSubCategoryMap,
    });

    // 获取 sa 应用
    try {
      const customSaApplicationMap = await this.listAllCustomSaApplications();
      allSaApplicationMap = {
        ...allSaApplicationMap,
        ...customSaApplicationMap,
      };
    } catch (error) {
      this.logger.error(
        "[npmd-dict] query custom sa application error: ",
        error
      );
    }
    mapFilter(allSaApplicationMap);
    dict.push({
      id: "sa_application",
      name: NPMD_DICT_FLEID_MAP["sa_application"],
      dict: allSaApplicationMap,
    });
    // 解析 SA End
    // =============================

    // 解析 geo Start
    // =============================
    // 全部的分类
    let allGeoCountryMap = <INpmdDictValueEnum>{};
    let allGeoProvinceMap = <INpmdDictValueEnum>{};
    let allGeoCityMap = <INpmdDictValueEnum>{};
    let allDistrictMap = <INpmdDictValueEnum>{};
    let allIspMap = <INpmdDictValueEnum>{};
    let allContinentMap = <INpmdDictValueEnum>{};

    try {
      const {
        countryMap,
        provinceMap,
        cityMap,
        districtMap,
        ispMap,
        continentMap,
      } = await this.parseNpmdGeoFromRestApi();
      allGeoCountryMap = { ...allGeoCountryMap, ...countryMap };
      allGeoProvinceMap = { ...allGeoProvinceMap, ...provinceMap };
      allGeoCityMap = { ...allGeoCityMap, ...cityMap };
      allDistrictMap = { ...allDistrictMap, ...districtMap };
      allIspMap = { ...allIspMap, ...ispMap };
      allContinentMap = { ...allContinentMap, ...continentMap };
    } catch (error) {
      this.logger.error("[npmd-dict] parse geo from restapi error: ", error);
    }

    // 解析内置的 geo
    // try {
    //   const { countryList, provinceList, cityList } = parseGeoKnowledges();
    //   countryList.forEach((el) => {
    //     allGeoCountryMap[el.countryId] = el.nameText;
    //   });
    //   provinceList.forEach((el) => {
    //     allGeoProvinceMap[el.provinceId] = el.nameText;
    //   });
    //   cityList.forEach((el) => {
    //     allGeoCityMap[el.cityId] = el.nameText;
    //   });
    // } catch (error) {
    //   this.logger.error("[npmd-dict] query geo knowledge error: ", error);
    // }

    // 获取 geo 国家
    try {
      const customGeoCountryMap = await this.listAllCustomCounteries();
      allGeoCountryMap = { ...allGeoCountryMap, ...customGeoCountryMap };
    } catch (error) {
      this.logger.error("[npmd-dict] query custom geo country error: ", error);
    }
    mapFilter(allGeoCountryMap);
    mapFilter(allGeoProvinceMap);
    mapFilter(allGeoCityMap);
    mapFilter(allDistrictMap);
    mapFilter(allIspMap);
    mapFilter(allContinentMap);
    dict.push({
      id: "geo_country",
      name: NPMD_DICT_FLEID_MAP["geo_country"],
      dict: allGeoCountryMap,
    });
    dict.push({
      id: "geo_province",
      name: NPMD_DICT_FLEID_MAP["geo_province"],
      dict: allGeoProvinceMap,
    });
    dict.push({
      id: "geo_city",
      name: NPMD_DICT_FLEID_MAP["geo_city"],
      dict: allGeoCityMap,
    });
    dict.push({
      id: "geo_district",
      name: NPMD_DICT_FLEID_MAP["geo_district"],
      dict: allDistrictMap,
    });
    dict.push({
      id: "geo_isp",
      name: NPMD_DICT_FLEID_MAP["geo_isp"],
      dict: allIspMap,
    });
    dict.push({
      id: "geo_continent",
      name: NPMD_DICT_FLEID_MAP["geo_continent"],
      dict: allContinentMap,
    });
    // 解析 geo End
    // =============================

    // 应用层协议
    // try {
    //   const protocolList = parseL7Protocols();

    //   const l7ProtocolMap = <INpmdDictValueEnum>{};
    //   for (let index = 0; index < protocolList.length; index++) {
    //     const element = protocolList[index];
    //     l7ProtocolMap[element.protocolId] = element.nameText;
    //   }

    //   dict["l7_protocol"] = l7ProtocolMap;
    // } catch (error) {
    //   dict["l7_protocol"] = {};

    //   this.logger.error("[npmd-dict] query l7 protocol error: ", error);
    // }
    let l7ProtocolMap = {};
    try {
      l7ProtocolMap = await this.parseNpmdL7ProtocolsFromRestApi();
    } catch (error) {}
    mapFilter(l7ProtocolMap);
    dict.push({
      id: "l7_protocol",
      name: NPMD_DICT_FLEID_MAP["l7_protocol"],
      dict: l7ProtocolMap,
    });

    // 各种常量
    dict.push({
      id: "application_type",
      name: NPMD_DICT_FLEID_MAP["application_type"],
      dict: enum2Map(EApplicationType),
    });
    dict.push({
      id: "ethernet_type",
      name: NPMD_DICT_FLEID_MAP["ethernet_type"],
      dict: enum2Map(EEthernetType),
    });
    dict.push({
      id: "icmp_version",
      name: NPMD_DICT_FLEID_MAP["icmp_version"],
      dict: enum2Map(EIcmpVersion),
    });
    dict.push({
      id: "icmp_v4_message_type",
      name: NPMD_DICT_FLEID_MAP["icmp_v4_message_type"],
      dict: enum2Map(EDhcpV4MessageType),
    });
    dict.push({
      id: "icmp_v6_message_type",
      name: NPMD_DICT_FLEID_MAP["icmp_v6_message_type"],
      dict: enum2Map(EDhcpV6MessageType),
    });
    dict.push({
      id: "os_version",
      name: NPMD_DICT_FLEID_MAP["os_version"],
      dict: OS_VERSION_MAP,
    });
    dict.push({
      id: "ip_protocol",
      name: NPMD_DICT_FLEID_MAP["ip_protocol"],
      dict: IP_PROTOCOL_MAP,
    });
    dict.push({
      id: "partition_name",
      name: NPMD_DICT_FLEID_MAP["partition_name"],
      dict: PARTITION_NAME_DICT,
    });
    dict.push({
      id: "asset_type",
      name: NPMD_DICT_FLEID_MAP["asset_type"],
      dict: enum2Map(EAssetType),
    });
    // 获取 登录状态字典
    dict.push({
      id: "mail_login_status",
      name: NPMD_DICT_FLEID_MAP["mail_login_status"],
      dict: enum2Map(EMailLoginStatus),
    });
    dict.push({
      id: "flow_log_ethernet_protocol",
      name: NPMD_DICT_FLEID_MAP["flow_log_ethernet_protocol"],
      dict: enum2Map(EFlowLogEthProtocol),
    });
    dict.push({
      id: "ip_locality",
      name: NPMD_DICT_FLEID_MAP["ip_locality"],
      dict: enum2Map(EIpAddressLocality),
    });
    dict.push({
      id: "http_analysis_type",
      name: NPMD_DICT_FLEID_MAP["http_analysis_type"],
      dict: enum2Map(EHttpAnalysisType),
    });
    dict.push({
      id: "protocol_dns_type",
      name: NPMD_DICT_FLEID_MAP["protocol_dns_type"],
      dict: PROTOCOL_DNS_TYPE_DICT,
    });
    dict.push({
      id: "protocol_mail_instruct",
      name: NPMD_DICT_FLEID_MAP["protocol_mail_instruct"],
      dict: enum2Map(EProtocolMailInstruct),
    });
    // 添加缓存
    // this.redisService.set(NPMD_DICT_CACHE_KEY, JSON.stringify(dict));
    // 30分钟自动过期
    // this.redisService.expire(NPMD_DICT_CACHE_KEY, 30 * 60);

    return dict;
  }

  /**
   * 查询 NPMD 所有未删除的 IP 地址组
   */
  async listAllHostGroups() {
    const [rows] = await this.npmdHostGroupModel.findAndCount({
      where: {
        // 全查
        deleted: EBooleanString.False,
      },
      order: { create_time: "DESC" },
    });

    const map = <INpmdDictValueEnum>{};
    rows.forEach((el) => {
      map[el.id] = generateName(el.name, el.deleted);
    });
    return map;
  }

  /**
   * 查询 NPMD 所有未删除的业务
   */
  async listAllServices() {
    const [rows] = await this.npmdApplianceServiceModel.findAndCount({
      where: {
        // 全查
        deleted: EBooleanString.False,
      },
      order: { create_time: "DESC" },
    });
    const map = <INpmdDictValueEnum>{};
    rows.forEach((el) => {
      map[el.id] = generateName(el.name, el.deleted);
    });
    return map;
  }

  /** 查询 NPMD 所有未删除策略 NpmdPolicy */
  async listAllPolicies() {
    if (isCms) {
      return {};
    }
    const [rows] = await this.npmdPolicyModel.findAndCount({
      where: {
        // 全查
        deleted: EBooleanString.False,
      },
      order: { create_time: "DESC" },
    });
    const map = <INpmdDictValueEnum>{};
    rows.forEach((el) => {
      map[el.id] = generateName(el.name, el.deleted);
    });
    return map;
  }

  /**
   * 查询 NPMD 所有未删除的自定义 SA 分类
   */
  async listAllCustomSaCategories() {
    const [rows] = await this.npmdCustomSaCategoryModel.findAndCount({
      where: {
        // 自增 ID，全查可能会重复
        deleted: EBooleanString.False,
      },
      order: { create_time: "DESC" },
    });

    const map = <INpmdDictValueEnum>{};
    rows.forEach((el) => {
      map[el.category_id] = generateName(el.name, el.deleted);
    });
    return map;
  }

  /**
   * 查询 NPMD 所有未删除的自定义 SA 子分类
   */
  async listAllCustomSaSubCategories() {
    const [rows] = await this.npmdCustomSaSubcategoryModel.findAndCount({
      where: {
        // 自增 ID，全查可能会重复
        deleted: EBooleanString.False,
      },
      order: { create_time: "DESC" },
    });

    const map = <INpmdDictValueEnum>{};
    rows.forEach((el) => {
      map[el.sub_category_id] = generateName(el.name, el.deleted);
    });
    return map;
  }

  /**
   * 查询 NPMD 所有未删除的自定义 SA 子分类
   */
  async listAllCustomSaApplications() {
    const [rows] = await this.npmdCustomSaApplicationModel.findAndCount({
      where: {
        // 自增 ID，全查可能会重复
        deleted: EBooleanString.False,
      },
      order: { create_time: "DESC" },
    });

    const map = <INpmdDictValueEnum>{};
    rows.forEach((el) => {
      map[el.application_id] = generateName(el.name, el.deleted);
    });
    return map;
  }

  /**
   * 查询 NPMD 所有未删除的自定义国家
   */
  async listAllCustomCounteries() {
    const [rows] = await this.npmdCustomGeoCountryModel.findAndCount({
      where: {
        // 自增 ID，全查可能会重复
        deleted: EBooleanString.False,
      },
      order: { create_time: "DESC" },
    });
    const map = <INpmdDictValueEnum>{};
    rows.forEach((el) => {
      map[el.country_id] = generateName(el.name, el.deleted);
    });
    return map;
  }

  /**
   * 获取 NPMD 外发邮箱配置
   */
  async querySmtpConfig() {
    return await this.npmdCmsSmtpModel.findOne({
      where: {
        deleted: EBooleanString.False,
      },
      order: { create_time: "DESC" },
    });
  }

  /**
   * 从 RESTapi 获取 NPMD 的 SA 规则库
   * @returns
   */
  async parseNpmdApplicationsFromRestApi() {
    const queryFunc = async () => {
      return await this.restapiService.get<INpmdRestAPiApplication>(
        isCms
          ? "/center/restapi/fpc-cms-v1/appliance/applications"
          : "/manager/restapi/fpc-v1/appliance/applications"
      );
    };
    const { applications, subCategorys, categorys } =
      await dictInfoCache.fetchIfNoExist("ApplicationsFromRestApi", queryFunc);
    // 解析结果，ID 和 label 映射成 map
    let applicationMap = <INpmdDictValueEnum>{};
    let subCategoryMap = <INpmdDictValueEnum>{};
    let categoryMap = <INpmdDictValueEnum>{};

    applications.forEach((el) => {
      applicationMap[el.applicationId] = el.name;
    });
    subCategorys.forEach((el) => {
      subCategoryMap[el.subCategoryId] = el.name;
    });
    categorys.forEach((el) => {
      categoryMap[el.categoryId] = el.name;
    });

    return { applicationMap, subCategoryMap, categoryMap };
  }

  /**
   * 从 RESTapi 获取 NPMD 的 Geo 规则库
   * @returns
   */
  async parseNpmdGeoFromRestApi() {
    const queryFunc = async () => {
      return await this.restapiService.get<INpmdRestAPiGeo>(
        isCms
          ? "/center/restapi/fpc-cms-v1/appliance/geolocations"
          : "/manager/restapi/fpc-v1/appliance/geolocations"
      );
    };
    const { countrys, provinces, citys, districts, isps, continents } =
      await dictInfoCache.fetchIfNoExist("GeoFromRestApi", queryFunc);
    // 解析结果，ID 和 label 映射成 map
    let countryMap = <INpmdDictValueEnum>{};
    let provinceMap = <INpmdDictValueEnum>{};
    let cityMap = <INpmdDictValueEnum>{};
    let districtMap = <INpmdDictValueEnum>{};
    let continentMap = <INpmdDictValueEnum>{};
    let ispMap = <INpmdDictValueEnum>{};

    // const concatName = (
    //   countryName?: string,
    //   provinceName?: string,
    //   cityName?: string,
    //   districtName?: string
    // ) => {
    //   let name = countryName;
    //   if (name) {
    //     name += "-";
    //   }
    //   if (provinceName) {
    //     name += provinceName;
    //   }
    //   if (cityName) {
    //     name += "-" + cityName;
    //   }
    //   if (districtName) {
    //     name += "-" + districtName;
    //   }
    //   return name;
    // };

    countrys.forEach((el) => {
      countryMap[el.countryId] = el.countryName;
    });
    provinces.forEach((el) => {
      provinceMap[el.provinceId] = el.provinceName;
    });
    citys.forEach((el) => {
      cityMap[el.cityId] = el.cityName;
    });
    districts.forEach((el) => {
      districtMap[el.districtId] = el.districtName;
    });

    isps.forEach((el) => {
      ispMap[el.ispId] = el.ispName;
    });

    continents.forEach((el) => {
      continentMap[el.continentId] = el.continentName;
    });

    return {
      countryMap,
      provinceMap,
      cityMap,
      districtMap,
      ispMap,
      continentMap,
    };
  }

  /**
   * 从 RESTapi 获取 NPMD 的 L7 protocol
   * @returns
   */
  async parseNpmdL7ProtocolsFromRestApi() {
    const queryFunc = async () => {
      return await this.restapiService.get<INpmdRestAPiL7Protocol[]>(
        isCms
          ? "/center/restapi/fpc-cms-v1/appliance/l7-protocols"
          : "/manager/restapi/fpc-v1/appliance/l7-protocols"
      );
    };
    const l7ProtocolList = await dictInfoCache.fetchIfNoExist(
      "L7ProtocolsFromRestApi",
      queryFunc
    );
    
    // 解析结果，ID 和 label 映射成 map
    let l7ProtocolMap = <INpmdDictValueEnum>{};

    l7ProtocolList.forEach((el) => {
      l7ProtocolMap[el.id] = el.name;
    });

    return l7ProtocolMap;
  }

  /**
   * 从 RESTapi 获取告警数量
   * @returns
   */
  async getAlarmFromRestApi(timeBegin: string, timeEnd: string) {
    const queryFunc = async () => {
      return (
        (await this.restapiService.get<any>(
          isCms
            ? `/center/restapi/fpc-cms-v1/appliance/alarm?${stringify({
                timeBegin,
                timeEnd,
              })}`
            : `/manager/restapi/fpc-v1/appliance/alarm?${stringify({
                timeBegin,
                timeEnd,
              })}`
        )) || []
      );
    };
    const alarmList = await dictInfoCache.fetchIfNoExist(
      "AlarmFromRestApi",
      queryFunc
    );

    return alarmList;
  }

  /**
   * 获取 自定义时间
   * @returns
   */
  async getCustomTimesFromRestApi() {
    const [customTimes] = isCms
      ? await this.npmdCmsCustomTimesModel.findAndCount({
          where: {
            type: ECustomTimeType.PeriodicTime,
            deleted: EBooleanString.False,
          },
          order: { create_time: "DESC" },
        })
      : await this.npmdCustomTimesModel.findAndCount({
          where: {
            type: ECustomTimeType.PeriodicTime,
            deleted: EBooleanString.False,
          },
          order: { create_time: "DESC" },
        });

    return customTimes.reduce((prev, curr) => {
      return {
        ...prev,
        [curr.id]: {
          ...curr,
        },
      };
    }, {}) as Record<string, ICustomTime>;
  }
}
