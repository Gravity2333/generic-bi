import { Rule, RuleType } from "@midwayjs/decorator";
import { EDatabaseType } from "@bi/common";

export class CreateDatabseInput {
  @Rule(
    RuleType.string()
      .valid(...Object.values(EDatabaseType))
      .required()
  )
  type: string;

  @Rule(RuleType.string().required())
  option: string;
}

export class UpdateDatabseInput extends CreateDatabseInput {
  @Rule(RuleType.string())
  id: string;
}
