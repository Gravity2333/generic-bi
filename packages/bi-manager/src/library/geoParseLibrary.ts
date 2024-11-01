// https://github.com/node-ffi/node-ffi/wiki/Node-FFI-Tutorial
// https://www.npmjs.com/package/ref-struct-di

// Is it possible to create an array of structs using ref-struct and ref-array?
// https://stackoverflow.com/questions/20835782/is-it-possible-to-create-an-array-of-structs-using-ref-struct-and-ref-array

import * as ffi from "ffi-napi";
import * as path from "path";
import * as refArray from "ref-array-napi";
import * as ref from "ref-napi";
import * as Struct from "ref-struct-napi";

/** name 字段的长度 */
const FIELD_NAME_LEN = 64;
/** 描述信息字段的长度 */
const FIELD_DESCRIPTION_LEN = 64;
/** 国家代码字段的长度 */
const FIELD_COUNTRY_CODE_LEN = 8;

// 定义返回值的类型
// =====================
type TId = string | number;

interface IGeoKnowledgeInfo {
  releaseDate: number;
  version: string;
}

interface IGeoRuleBase {
  /** 英文名字 */
  name: string;
  /** 中文名字 */
  nameText: string;
  /** 英文备注 */
  description?: string;
  /** 中文备注 */
  descriptionText?: string;
  longtitude: number;
  latitude: number;
}

interface IGeoCountry extends IGeoRuleBase {
  countryId: TId;
  countryCode: string;
}
interface IGeoProvince extends IGeoRuleBase {
  countryId: TId;
  provinceId: TId;
}
interface IGeoCity extends IGeoRuleBase {
  countryId: TId;
  provinceId: TId;
  cityId: TId;
}

// 定义结构体的类型
// =====================
interface IStructureBase {
  cNameCn: Buffer;
  cNameEn: Buffer;
  cDescCn: Buffer;
  cDescEn: Buffer;
  fLongtitude: number;
  fLatitude: number;
}
interface IGeoCountryStructure extends IStructureBase {
  iCountryId: TId;
  cCountryCode: Buffer;
}
interface IGeoProvinceStructure extends IStructureBase {
  iProvinceId: TId;
  iCountryId: TId;
}
interface IGeoCityStructure extends IStructureBase {
  iCityId: TId;
  iProvinceId: TId;
  iCountryId: TId;
}

/** 国家结构体 */
const GeoCountryStructure = Struct({
  iCountryId: ref.types.int16,
  cNameCn: refArray(ref.types.char, FIELD_NAME_LEN),
  cNameEn: refArray(ref.types.char, FIELD_NAME_LEN),
  cDescCn: refArray(ref.types.char, FIELD_DESCRIPTION_LEN),
  cDescEn: refArray(ref.types.char, FIELD_DESCRIPTION_LEN),
  cCountryCode: refArray(ref.types.char, FIELD_COUNTRY_CODE_LEN),
  fLongtitude: ref.types.float,
  fLatitude: ref.types.float,
});

/** 省份结构体 */
const GeoProvinceStructure = Struct({
  iProvinceId: ref.types.int16,
  iCountryId: ref.types.int16,
  cNameCn: refArray(ref.types.char, FIELD_NAME_LEN),
  cNameEn: refArray(ref.types.char, FIELD_NAME_LEN),
  cDescCn: refArray(ref.types.char, FIELD_DESCRIPTION_LEN),
  cDescEn: refArray(ref.types.char, FIELD_DESCRIPTION_LEN),
  fLongtitude: ref.types.float,
  fLatitude: ref.types.float,
});

/** 城市结构体 */
const GeoCityStructure = Struct({
  iCityId: ref.types.int16,
  iProvinceId: ref.types.int16,
  iCountryId: ref.types.int16,
  cNameCn: refArray(ref.types.char, FIELD_NAME_LEN),
  cNameEn: refArray(ref.types.char, FIELD_NAME_LEN),
  cDescCn: refArray(ref.types.char, FIELD_DESCRIPTION_LEN),
  cDescEn: refArray(ref.types.char, FIELD_DESCRIPTION_LEN),
  fLongtitude: ref.types.float,
  fLatitude: ref.types.float,
});

const soPath = path.join(__dirname, "./libs/libgeoip.so");
const ruleFilePath = path.join(__dirname, "./knowledges/geoip_rule_enc.txt");

let geoParseLibrary: Record<string, any> = {};

try {
  // TODO: 指定 so 库路径
  geoParseLibrary = new ffi.Library(soPath, {
    // GEOIP初始化,前端传入NULL即可
    // int geoip_init(void *compile_call_back);
    geoip_init: [ref.types.int, ["pointer"]],

    // GEOIP去始化
    // void geoip_parse_deinit();
    geoip_parse_deinit: [ref.types.void, []],

    // 解析GEOIP规则文件
    // int geoip_parse_file(char *file_path);
    geoip_parse_file: [ref.types.int, ["string"]],

    // 获取版本号
    // int geoip_parse_get_version(unsigned char **version);
    geoip_parse_get_version: [ref.types.int, [ref.refType(ref.types.uchar)]],

    // 获取时间戳
    // int geoip_parse_get_time(unsigned int *timestamp);
    geoip_parse_get_time: [ref.types.int, [ref.refType(ref.types.uint)]],

    // 获取国家字典
    // int geoip_parse_get_country_dict_all(GEOIP_COUNTRY_DICT **country_dict, int32_t *country_num);
    geoip_parse_get_country_dict_all: [
      ref.types.int,
      [
        ref.refType(refArray(GeoCountryStructure)),
        ref.refType(ref.types.int32),
      ],
    ],

    // 获取省份字典
    // int geoip_parse_get_province_dict_all(GEOIP_PROVINCE_DICT **province_dict, int32_t
    // *province_num);
    geoip_parse_get_province_dict_all: [
      ref.types.int,
      [
        ref.refType(refArray(GeoProvinceStructure)),
        ref.refType(ref.types.int32),
      ],
    ],

    // 获取城市字典
    // int geoip_parse_get_city_dict_all(GEOIP_CITY_DICT **city_dict, int32_t *city_num);
    geoip_parse_get_city_dict_all: [
      ref.types.int,
      [ref.refType(refArray(GeoCityStructure)), ref.refType(ref.types.int32)],
    ],

    // 释放获取的结果集
    // void geoip_free_result(void **result);
    geoip_free_result: [ref.types.int, ["pointer"]],
  });
} catch (error) {
}

/**
 * 获取Geo地区库文件信息
 * @param filePath
 */
export const queryGeoKnowledgeInfos = (filePath: string = ruleFilePath) => {
  const result = <IGeoKnowledgeInfo>{};
  try {
    // 初始化
    init(filePath);

    // 上传时间
    const timeRef = ref.alloc("int");
    if (geoParseLibrary.geoip_parse_get_time(timeRef as any) === 0) {
      const time = timeRef.deref();
      result.releaseDate = new Date(time * 1000).valueOf();
    }

    // 版本信息
    const versionRef = ref.alloc("string");
    if (geoParseLibrary.geoip_parse_get_version(versionRef as any) === 0) {
      const version = versionRef.deref();
      result.version = version;
    }
    return result;
  } catch (error) {
    throw new Error("GeoIP地区库文件解析失败");
  } finally {
    geoParseLibrary.geoip_parse_deinit();
  }
};

/**
 * 解析Geo地区库
 * @param filePath
 */
export const parseGeoKnowledges = (filePath: string = ruleFilePath) => {
  const countryList: IGeoCountry[] = [];
  const provinceList: IGeoProvince[] = [];
  const cityList: IGeoCity[] = [];

  try {
    // 初始化
    init(filePath);

    // 解析国家
    // ==========================
    const countryListRef = ref.alloc(refArray(GeoCountryStructure));
    const countryCountRef = ref.alloc("int");
    if (
      geoParseLibrary.geoip_parse_get_country_dict_all(
        countryListRef,
        countryCountRef as any
      ) === 0
    ) {
      // 数量
      const count = countryCountRef.deref();

      if (count > 0) {
        const array = countryListRef.readPointer(
          0,
          count * GeoCountryStructure.size
        );
        for (let i = 0; i < count; i++) {
          const item: IGeoCountryStructure = ref.get(
            array,
            i * GeoCountryStructure.size,
            GeoCountryStructure
          );

          countryList.push({
            countryId: item.iCountryId,
            name: buffer2String(item.cNameEn),
            nameText: buffer2String(item.cNameCn),
            description: buffer2String(item.cDescEn),
            descriptionText: buffer2String(item.cDescCn),
            countryCode: buffer2String(item.cCountryCode),
            longtitude: item.fLongtitude,
            latitude: item.fLatitude,
          });
        }
      }
      geoParseLibrary.geoip_free_result(countryListRef);
    }

    // 解析省份
    // ==========================
    const provinceListRef = ref.alloc(refArray(GeoProvinceStructure));
    const provinceCountRef = ref.alloc("int");
    if (
      geoParseLibrary.geoip_parse_get_province_dict_all(
        provinceListRef,
        provinceCountRef as any
      ) === 0
    ) {
      // 数量
      const count = provinceCountRef.deref();

      if (count > 0) {
        const array = provinceListRef.readPointer(
          0,
          count * GeoProvinceStructure.size
        );
        for (let i = 0; i < count; i++) {
          const item: IGeoProvinceStructure = ref.get(
            array,
            i * GeoProvinceStructure.size,
            GeoProvinceStructure
          );

          provinceList.push({
            provinceId: item.iProvinceId,
            countryId: item.iCountryId,
            name: buffer2String(item.cNameEn),
            nameText: buffer2String(item.cNameCn),
            description: buffer2String(item.cDescEn),
            descriptionText: buffer2String(item.cDescCn),
            longtitude: item.fLongtitude,
            latitude: item.fLatitude,
          });
        }
      }
      geoParseLibrary.geoip_free_result(provinceListRef);
    }

    // 解析城市
    // ==========================
    const cityListRef = ref.alloc(refArray(GeoCityStructure));
    const cityCountRef = ref.alloc("int");
    if (
      geoParseLibrary.geoip_parse_get_city_dict_all(
        cityListRef,
        cityCountRef as any
      ) === 0
    ) {
      // 数量
      const count = cityCountRef.deref();

      if (count > 0) {
        const array = cityListRef.readPointer(0, count * GeoCityStructure.size);
        for (let i = 0; i < count; i++) {
          const item: IGeoCityStructure = ref.get(
            array,
            i * GeoCityStructure.size,
            GeoCityStructure
          );

          cityList.push({
            cityId: item.iCityId,
            provinceId: item.iProvinceId,
            countryId: item.iCountryId,
            name: buffer2String(item.cNameEn),
            nameText: buffer2String(item.cNameCn),
            description: buffer2String(item.cDescEn),
            descriptionText: buffer2String(item.cDescCn),
            longtitude: item.fLongtitude,
            latitude: item.fLatitude,
          });
        }
      }

      geoParseLibrary.geoip_free_result(cityListRef);
    }

    return {
      countryList,
      provinceList,
      cityList,
    };
  } catch (error) {
    throw new Error("GeoIP地区库文件解析失败");
  } finally {
    geoParseLibrary.geoip_parse_deinit();
  }
};

/**
 * 初始化
 * @param filePath
 */
const init = (filePath: string) => {
  if (geoParseLibrary.geoip_init(null) !== 0) {
    throw new Error("failed to init geoip");
  }
  if (geoParseLibrary.geoip_parse_file(filePath) !== 0) {
    throw new Error("failed to parse geoip file");
  }
};

/**
 * Buffer => UTF8
 * @param buffer
 * @returns
 */
const buffer2String = (buffer: Buffer) => {
  return Buffer.from(buffer.buffer).readCString();
};

// queryGeoKnowledgeInfos("./geoip_rule_enc.txt");
// parseGeoKnowledges("./geoip_rule_enc.txt");
