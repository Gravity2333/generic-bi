import { Rule, RuleType } from "@midwayjs/decorator";
import { ECronType, EReportSenderType } from "@bi/common";
import { PaginationInput } from "./common.dto";

export class QueryReportInput extends PaginationInput {
  @Rule(RuleType.string().optional().allow(""))
  name: string;
}

export class CreateReportInput {
  @Rule(RuleType.string().required().min(2).max(32))
  name: string;

  @Rule(RuleType.array().items(RuleType.string()).required())
  dashboard_ids: string[];

  @Rule(RuleType.string().required())
  cron: string;

  @Rule(RuleType.string().required())
  exec_time: string;

  @Rule(RuleType.string().required())
  timezone: string;

  @Rule(
    RuleType.string()
      .valid(...Object.values(ECronType))
      .required()
  )
  cron_type: EReportSenderType;

  @Rule(
    RuleType.string()
      .valid(...Object.values(EReportSenderType))
      .required()
  )
  sender_type: EReportSenderType;

  @Rule(RuleType.string().required())
  sender_options: string;

  @Rule(RuleType.string().allow(""))
  description: string;

  @Rule(RuleType.string())
  global_time_range: string;
}

export class UpdateReportInput extends CreateReportInput {
  @Rule(RuleType.string().required())
  id: string;
}
