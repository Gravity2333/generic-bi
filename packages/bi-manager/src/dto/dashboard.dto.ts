import { Rule, RuleType } from "@midwayjs/decorator";
import { PaginationInput } from "./common.dto";

/**
 * 查询参数
 */
export class QueryDashboardInput extends PaginationInput {
  @Rule(RuleType.string().optional().allow(""))
  name: string;
}

/**
 * 新建
 */
export class CreateDashboardInput {
  @Rule(RuleType.string().required().min(2).max(32))
  name: string;

  @Rule(RuleType.array().items(RuleType.string()).required())
  widget_ids: string[];

  @Rule(RuleType.string().required())
  specification: string;

  @Rule(RuleType.string().allow(""))
  description: string;

  @Rule(RuleType.string().allow(""))
  readonly?: string;
}

/**
 * 编辑
 */
export class UpdateDashboardInput extends CreateDashboardInput {
  @Rule(RuleType.string().required())
  id: string;
}
