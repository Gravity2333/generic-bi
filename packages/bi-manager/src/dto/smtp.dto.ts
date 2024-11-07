import { Rule, RuleType } from "@midwayjs/decorator";

export class CreateSMTPInput {
  @Rule(RuleType.number().required())
  encrypt: number;

  @Rule(RuleType.string().required())
  login_password: string;

  @Rule(RuleType.string().required())
  login_user: string;

  @Rule(RuleType.string().required())
  mail_address: string;

  @Rule(RuleType.string().required())
  mail_username: string;

  @Rule(RuleType.number().allow(""))
  server_port: number;

  @Rule(RuleType.string().allow(""))
  smtp_server: string;
}

export class UpdateSMTPInput extends CreateSMTPInput {
  @Rule(RuleType.string())
  id: string;
}
