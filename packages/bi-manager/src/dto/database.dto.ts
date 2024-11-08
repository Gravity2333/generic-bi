import { Rule, RuleType } from "@midwayjs/decorator";
import { EDatabaseType } from "@bi/common";

export class CreateDatabseInput {
  @Rule(RuleType.string().required())
  name: string;

  @Rule(
    RuleType.string()
      .valid(...Object.values(EDatabaseType))
      .required()
  )
  type: string;

  @Rule(RuleType.string().allow(""))
  readonly: string;
  
  @Rule(RuleType.string().required())
  option: string;
}

export class UpdateDatabseInput extends CreateDatabseInput {
  @Rule(RuleType.string())
  id: string;
}
