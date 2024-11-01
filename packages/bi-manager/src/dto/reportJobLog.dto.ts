import {
  EReportJobExecutionResult,
  EReportJobTriggerType,
  EReportJobStatus,
} from "@bi/common";
import { Rule, RuleType } from "@midwayjs/decorator";
import { PaginationInput } from "./common.dto";

export class QueryReportJobLogInput extends PaginationInput {
  @Rule(RuleType.string().optional().allow(""))
  report_id: string;
}

export class CreateReportJobLogInput {
  @Rule(RuleType.string().required())
  report_id: string;

  @Rule(
    RuleType.string()
      .valid(...Object.values(EReportJobTriggerType))
      .required()
  )
  trigger_type: string;

  @Rule(
    RuleType.string()
      .valid(...Object.values(EReportJobStatus))
      .required()
  )
  status: string;

  @Rule(
    RuleType.string()
      .valid(...Object.values(EReportJobExecutionResult))
      .optional()
      .allow("")
      .default("")
  )
  execution_result?: string;

  @Rule(RuleType.string().optional().allow("").default(""))
  execution_file?: string;

  @Rule(RuleType.string().optional().allow("").default(""))
  execution_log?: string;

  @Rule(RuleType.string().optional().allow("").default(""))
  created_by?: string;
}

export class UpdateReportJobLogInput extends CreateReportJobLogInput {
  @Rule(RuleType.string().required())
  id: string;
}
