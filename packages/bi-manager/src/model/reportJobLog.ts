import {
  EReportJobExecutionResult,
  EReportJobStatus,
  EReportJobTriggerType,
} from "@bi/common";
import { BaseTable } from "@midwayjs/sequelize";
import {
  Column,
  CreatedAt,
  DataType,
  Default,
  DeletedAt,
  IsUUID,
  Model,
  PrimaryKey,
  UpdatedAt,
} from "sequelize-typescript";

@BaseTable({ tableName: "bi_report_job_log" })
export default class ReportJob extends Model {
  @IsUUID(4)
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column({ type: DataType.UUIDV4, comment: "ID" })
  id: string;

  @Column({ type: DataType.STRING, comment: "报表 ID" })
  report_id: string;

  @Column({
    type: DataType.ENUM(...Object.values(EReportJobTriggerType)),
    comment: "触发方式",
  })
  trigger_type: string;

  @Column({
    type: DataType.ENUM(...Object.values(EReportJobStatus)),
    comment: "任务状态",
  })
  status: string;

  @Column({
    type: DataType.ENUM(...Object.values(EReportJobExecutionResult)),
    comment: "执行结果",
    defaultValue: "",
  })
  execution_result?: string;

  @Column({ type: DataType.TEXT, comment: "执行日志", defaultValue: "" })
  execution_log?: string;

  @Column({ type: DataType.TEXT, comment: "生成的文件", defaultValue: "" })
  execution_file?: string;

  @Column({ type: DataType.STRING, comment: "触发人 ID", defaultValue: "" })
  created_by?: string;

  @CreatedAt
  @Column
  created_at: Date;

  @UpdatedAt
  @Column
  updated_at: Date;

  @DeletedAt
  @Column
  deleted_at?: Date;
}
