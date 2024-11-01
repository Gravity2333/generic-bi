import { Rule, RuleType } from "@midwayjs/decorator";

export class PaginationInput {
  @Rule(RuleType.number().optional().default(0).min(0))
  pageNumber?: number;

  @Rule(RuleType.number().optional().default(20).min(1).max(200))
  pageSize?: number;
}
