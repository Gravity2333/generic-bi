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
const FIELD_DESCRIPTION_LEN = 256;

/** 分类的最大数量 */
// const SA_CATEGORY_MAX_NUM = 255;
// /** 子分类的最大数量 */
// const SA_SUBCATEGORY_MAX_NUM = 1600;
// /** 协议的最大数量 */
// const SA_PROTOCOL_MAX_NUM = 1600;
// /** 应用的最大数量 */
// const SA_APPLICATION_MAX_NUM = 16000;

// 定义返回值的类型
// =====================
interface ISaKnowledgeInfo {
  releaseDate: number;
  version: string;
}

type TId = string | number;

interface ISaRuleBase {
  /** 英文名字 */
  name: string;
  /** 中文名字 */
  nameText: string;
  /** 英文备注 */
  description?: string;
  /** 中文备注 */
  descriptionText?: string;
}
export interface ISaCategory extends ISaRuleBase {
  categoryId: TId;
}
export interface ISaSubCategory extends ISaRuleBase {
  categoryId: TId;
  subCategoryId: TId;
}
export interface ISaApplication extends ISaRuleBase {
  categoryId: TId;
  subCategoryId: TId;
  applicationId: TId;
}
export interface ISaProtocol extends ISaRuleBase {
  protocolId: TId;
}

// 定义结构体的类型
// =====================
interface IStructureBase {
  cNameCn: Buffer;
  cNameEn: Buffer;
  cDescCn: Buffer;
  cDescEn: Buffer;
}
interface ISaCategoryStructure extends IStructureBase {
  ucCategoryId: TId;
}
interface ISaSubCategoryStructure extends IStructureBase {
  ucCategoryId: TId;
  uiSubCategoryId: TId;
}
interface ISaApplicationStructure extends IStructureBase {
  ucCategoryId: TId;
  uiSubCategoryId: TId;
  uiApplicationId: TId;
}
interface ISaProtocolStructure extends IStructureBase {
  uiProtocolId: TId;
}

/** 分类结构体 */
const SaCategoryStructure = Struct({
  ucCategoryId: ref.types.uchar,
  ucRes: refArray(ref.types.uchar, 3),
  cNameCn: refArray(ref.types.char, FIELD_NAME_LEN),
  cNameEn: refArray(ref.types.char, FIELD_NAME_LEN),
  cDescCn: refArray(ref.types.char, FIELD_DESCRIPTION_LEN),
  cDescEn: refArray(ref.types.char, FIELD_DESCRIPTION_LEN),
});

/** 子分类结构体 */
const SaSubCategoryStructure = Struct({
  ucCategoryId: ref.types.uchar,
  ucRes: refArray(ref.types.uchar, 3),
  uiSubCategoryId: ref.types.uint,
  cNameCn: refArray(ref.types.char, FIELD_NAME_LEN),
  cNameEn: refArray(ref.types.char, FIELD_NAME_LEN),
  cDescCn: refArray(ref.types.char, FIELD_DESCRIPTION_LEN),
  cDescEn: refArray(ref.types.char, FIELD_DESCRIPTION_LEN),
});

/** 应用结构体 */
const SaApplicationStructure = Struct({
  ucCategoryId: ref.types.uchar,
  ucRes: refArray(ref.types.uchar, 3),
  uiSubCategoryId: ref.types.uint,
  uiApplicationId: ref.types.uint,
  cNameCn: refArray(ref.types.char, FIELD_NAME_LEN),
  cNameEn: refArray(ref.types.char, FIELD_NAME_LEN),
  cDescCn: refArray(ref.types.char, FIELD_DESCRIPTION_LEN),
  cDescEn: refArray(ref.types.char, FIELD_DESCRIPTION_LEN),
});

const SaProtocolStructure = Struct({
  uiProtocolId: ref.types.uint,
  cNameCn: refArray(ref.types.char, FIELD_NAME_LEN),
  cNameEn: refArray(ref.types.char, FIELD_NAME_LEN),
  cDescCn: refArray(ref.types.char, FIELD_DESCRIPTION_LEN),
  cDescEn: refArray(ref.types.char, FIELD_DESCRIPTION_LEN),
});

const soPath = path.join(__dirname, "./libs/libparse.so");
const ruleFilePath = path.join(__dirname, "./knowledges/sa_rule_enc.txt");

let saParseLibrary: Record<string, any> = {};

try {
  // TODO: 指定 so 库路径
  saParseLibrary = new ffi.Library(soPath, {
    // 初始化接口, 返回0初始化成功
    // int sa_libparse_init(void * pfCompile)
    sa_libparse_init: [ref.types.int, ["pointer"]],

    // 去初始化接口
    // void sa_libparse_deinit(void)
    sa_libparse_deinit: [ref.types.void, []],

    // 规则库密文文件解析接口, pcFilePathIn:规则库密文文件路径, 返回0解析成功
    // int sa_libparse_parse_file(char *pcFilePathIn)
    sa_libparse_parse_file: [ref.types.int, ["string"]],

    // ppucVersion:存储规则库版本号的指针，输出参数,返回0获取成功
    // int sa_libparse_get_version(unsigned char **ppucVersion)
    sa_libparse_get_version: [ref.types.int, [ref.refType("string")]],

    // timestamp:存储规则库时间戳的指针，输出参数, 返回0获取成功
    // int sa_libparse_get_time(unsigned int *timestamp)
    sa_libparse_get_time: [ref.types.int, [ref.refType(ref.types.uint)]],

    // 获取规则库支持的所有分类信息
    // int sa_libparse_get_category(LIBPARSE_CATEGORY **ppstCategory, unsigned int *puiNum)
    sa_libparse_get_category: [
      ref.types.int,
      [ref.refType(refArray(SaCategoryStructure)), ref.refType(ref.types.uint)],
    ],

    // int sa_libparse_get_subcategory(LIBPARSE_SUBCATEGORY **ppstSubcategory, unsigned int *puiNum)
    // 获取规则库支持的所有子分类信息
    sa_libparse_get_subcategory: [
      ref.types.int,
      [
        ref.refType(refArray(SaSubCategoryStructure)),
        ref.refType(ref.types.uint),
      ],
    ],

    // int sa_libparse_get_application(LIBPARSE_APPLICATION **ppstApp, unsigned int *puiNum)
    // 获取规则库支持的所有应用信息
    sa_libparse_get_application: [
      ref.types.int,
      [
        ref.refType(refArray(SaApplicationStructure)),
        ref.refType(ref.types.uint),
      ],
    ],

    // int sa_libparse_get_protocol(LIBPARSE_PROTOCOL **ppstProtocol, unsigned int *puiNum)
    // 获取协议信息
    sa_libparse_get_protocol: [
      ref.types.int,
      [ref.refType(refArray(SaProtocolStructure)), ref.refType(ref.types.uint)],
    ],

    // 获取规则库相关资源后，需调用此接口释放结果集
    // void sa_libparse_free_result(void **ppstResult)
    sa_libparse_free_result: [ref.types.int, ["pointer"]],
  });
} catch (error) {
}

/**
 * 获取SA规则库文件信息
 * @param filePath sa规则库文件路径
 */
export const querySaKnowledgeInfos = (filePath: string = ruleFilePath) => {
  const result = <ISaKnowledgeInfo>{};

  try {
    // 初始化
    init(filePath);

    // 上传时间
    const timeRef = ref.alloc(ref.types.uint);
    if (saParseLibrary.sa_libparse_get_time(timeRef as any) === 0) {
      const time = timeRef.deref();
      result.releaseDate = new Date(time * 1000).valueOf();
    }

    // 版本信息
    const versionRef = ref.alloc("string");
    if (saParseLibrary.sa_libparse_get_version(versionRef as any) === 0) {
      const version = versionRef.deref();
      result.version = version;
    }

    return result;
  } catch (error) {
    throw new Error("SA规则库文件解析失败");
  } finally {
    saParseLibrary.sa_libparse_deinit();
  }
};

/**
 * 解析 SA 规则
 * @param filePath sa规则库文件路径
 */
export const parseSaKnowledges = (filePath: string = ruleFilePath) => {
  const categoryList: ISaCategory[] = [];
  const subCategoryList: ISaSubCategory[] = [];
  const applicationList: ISaApplication[] = [];

  try {
    // 初始化
    init(filePath);

    // 解析分类
    // ==========================
    const categoryListRef = ref.alloc(
      refArray(
        SaCategoryStructure
        // SA_CATEGORY_MAX_NUM
      )
    );
    const categoryCountRef = ref.alloc("int").ref();
    if (
      saParseLibrary.sa_libparse_get_category(
        categoryListRef,
        categoryCountRef
      ) === 0
    ) {
      // 数量
      const count = categoryCountRef.deref();
      //@ts-ignore
      if (count > 0) {
        const array = categoryListRef.readPointer(
          0,
          //@ts-ignore
          count * SaCategoryStructure.size
        );
        //@ts-ignore
        for (let i = 0; i < count+0; i++) {
          const item: ISaCategoryStructure = ref.get(
            array,
            i * SaCategoryStructure.size,
            SaCategoryStructure
          );

          categoryList.push({
            categoryId: item.ucCategoryId,
            name: buffer2String(item.cNameEn),
            nameText: buffer2String(item.cNameCn),
            description: buffer2String(item.cDescEn),
            descriptionText: buffer2String(item.cDescCn),
          });
        }
      }

      saParseLibrary.sa_libparse_free_result(categoryListRef);
    }

    // 解析子分类
    // ==========================
    const subCategoryListRef = ref.alloc(
      refArray(
        SaSubCategoryStructure
        // SA_SUBCATEGORY_MAX_NUM
      )
    );
    const subCategoryCountRef = ref.alloc("int");
    if (
      saParseLibrary.sa_libparse_get_subcategory(
        subCategoryListRef,
        subCategoryCountRef as any
      ) === 0
    ) {
      // 数量
      const count = subCategoryCountRef.deref();

      if (count > 0) {
        const array = subCategoryListRef.readPointer(
          0,
          count * SaSubCategoryStructure.size
        );
        for (let i = 0; i < count; i++) {
          const item: ISaSubCategoryStructure = ref.get(
            array,
            i * SaSubCategoryStructure.size,
            SaSubCategoryStructure
          );

          subCategoryList.push({
            categoryId: item.ucCategoryId,
            subCategoryId: item.uiSubCategoryId,
            name: buffer2String(item.cNameEn),
            nameText: buffer2String(item.cNameCn),
            description: buffer2String(item.cDescEn),
            descriptionText: buffer2String(item.cDescCn),
          });
        }
      }
      saParseLibrary.sa_libparse_free_result(subCategoryListRef);
    }

    // 解析应用
    // ==========================
    const applicationListRef = ref.alloc(
      refArray(
        SaApplicationStructure
        // SA_APPLICATION_MAX_NUM
      )
    );
    const applicationCountRef = ref.alloc("int");
    if (
      saParseLibrary.sa_libparse_get_application(
        applicationListRef,
        applicationCountRef as any
      ) === 0
    ) {
      // 数量
      const count = applicationCountRef.deref();

      if (count > 0) {
        const array = applicationListRef.readPointer(
          0,
          count * SaApplicationStructure.size
        );
        for (let i = 0; i < count; i++) {
          const item: ISaApplicationStructure = ref.get(
            array,
            i * SaApplicationStructure.size,
            SaApplicationStructure
          );

          applicationList.push({
            categoryId: item.ucCategoryId,
            subCategoryId: item.uiSubCategoryId,
            applicationId: item.uiApplicationId,
            name: buffer2String(item.cNameEn),
            nameText: buffer2String(item.cNameCn),
            description: buffer2String(item.cDescEn),
            descriptionText: buffer2String(item.cDescCn),
          });
        }
      }
      saParseLibrary.sa_libparse_free_result(applicationListRef);
    }

    return {
      categoryList,
      subCategoryList,
      applicationList,
    };
  } catch (error) {
    throw new Error("SA规则库文件解析失败");
  } finally {
    saParseLibrary.sa_libparse_deinit();
  }
};

/**
 * 解析 SA 应用层协议
 * @param {string} filePath
 */
export const parseL7Protocols = (filePath: string = ruleFilePath) => {
  const protocolList: ISaProtocol[] = [];

  try {
    // 初始化
    init(filePath);

    // 解析分类
    // ==========================
    const protocolListRef = ref.alloc(
      refArray(
        SaProtocolStructure
        // SA_PROTOCOL_MAX_NUM
      )
    );
    const protocolCountRef = ref.alloc("int");
    if (
      saParseLibrary.sa_libparse_get_protocol(
        protocolListRef,
        protocolCountRef as any
      ) === 0
    ) {
      // 数量
      const count = protocolCountRef.deref();

      if (count > 0) {
        const array = protocolListRef.readPointer(
          0,
          count * SaProtocolStructure.size
        );
        for (let i = 0; i < count; i++) {
          const item: ISaProtocolStructure = ref.get(
            array,
            i * SaProtocolStructure.size,
            SaProtocolStructure
          );

          protocolList.push({
            protocolId: item.uiProtocolId,
            name: buffer2String(item.cNameEn),
            nameText: buffer2String(item.cNameCn),
            description: buffer2String(item.cDescEn),
            descriptionText: buffer2String(item.cDescCn),
          });
        }
      }
      saParseLibrary.sa_libparse_free_result(protocolListRef);
    }
    return protocolList;
  } catch (error) {
    throw new Error("SA规则库文件解析失败");
  } finally {
    saParseLibrary.sa_libparse_deinit();
  }
};

/**
 * 初始化
 * @param filePath
 */
const init = (filePath: string) => {
  if (saParseLibrary.sa_libparse_init(null) !== 0) {
    throw new Error("failed to init sa knowledge");
  }
  if (saParseLibrary.sa_libparse_parse_file(filePath) !== 0) {
    throw new Error("failed to parse sa knowledge file");
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

// querySaKnowledgeInfos("./sa_rule_enc.txt");
// parseSaKnowledges("./sa_rule_enc.txt");
// parseL7Protocols("./sa_rule_enc.txt");
