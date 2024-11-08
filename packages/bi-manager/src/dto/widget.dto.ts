import { Rule, RuleType } from "@midwayjs/decorator";
import { EVisualizationType } from "@bi/common";
import { PaginationInput } from "./common.dto";

export class QueryWidgetInput extends PaginationInput {
  @Rule(RuleType.string().optional().allow(""))
  name: string;
}

export class CreateWidgetInput {
  @Rule(RuleType.string().required().min(2).max(32))
  name: string;

  @Rule(RuleType.string())
  database: string;

  @Rule(RuleType.string())
  datasource: string;

  @Rule(
    RuleType.string()
      .valid(...Object.values(EVisualizationType))
      .required()
  )
  viz_type: string;

  @Rule(RuleType.string().required())
  specification: string;

  @Rule(RuleType.string().allow(""))
  description: string;

  @Rule(RuleType.string().allow(""))
  readonly: string;

  @Rule(RuleType.string().allow(""))
  template: string;
}

export class UpdateWidgetInput extends CreateWidgetInput {
  @Rule(RuleType.string().required())
  id: string;
}
