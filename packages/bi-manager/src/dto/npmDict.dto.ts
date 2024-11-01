import { NPMD_DICT_FLEID_LIST } from "@bi/common";
import { Rule, RuleType } from "@midwayjs/decorator";

/** 查询字典时的参数 */
export class QueryNpmdDictInput {
  @Rule(RuleType.boolean().truthy("1").falsy("0"))
  forceFlush?: boolean;
}

/** 查询字典映射关系时的参数 */
export class QueryNpmdDictMappingInput {
  @Rule(RuleType.string())
  table_name: string;
}

/** 创建字典映射关系时的参数 */
export class CreateNpmdDictInput {
  @Rule(RuleType.string().required())
  table_name: string;

  @Rule(RuleType.string().required())
  table_field: string;

  @Rule(
    RuleType.string()
      .valid(...NPMD_DICT_FLEID_LIST)
      .required()
  )
  dict_field: string;
}

export class UpdateNpmdDictInput extends CreateNpmdDictInput {
  @Rule(RuleType.string().required())
  id: string;
}
