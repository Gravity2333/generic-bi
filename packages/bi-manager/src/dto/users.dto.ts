import { Rule, RuleType } from "@midwayjs/decorator";

export class CreateUserInput {
  @Rule(RuleType.string().required())
  username: string;

  @Rule(RuleType.string().required())
  password: string;

  @Rule(RuleType.string().required())
  role: string;

  @Rule(RuleType.string().required())
  nickname: string;

  @Rule(RuleType.string())
  avator: string;
}

export class UpdateUserInput extends CreateUserInput {
  @Rule(RuleType.string())
  id: string;
}

export type LoginInput = Pick<CreateUserInput,'username'|'password'>