import { ECronType, EReportSenderType } from "@bi/common";
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

@BaseTable({ tableName: "bi_report" })
export default class Report extends Model {
  @IsUUID(4)
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column({ type: DataType.UUIDV4, comment: "ID" })
  id: string;

  @Column({ type: DataType.STRING, comment: "名称" })
  name: string;

  // @see: https://github.com/typeorm/typeorm/blob/master/test/functional/database-schema/column-types/postgres/entity/Post.ts#L249-L250
  @Column({ type: DataType.ARRAY(DataType.STRING), comment: "选择的仪表盘IDs" })
  dashboard_ids: string[];

  @Column({ type: DataType.STRING, comment: "Cron表达式" })
  cron: string;

  @Column({ type: DataType.STRING, comment: "执行时间" })
  exec_time: string;

  @Column({ type: DataType.STRING, comment: "时区" })
  timezone: string;

  @Column({
    type: DataType.ENUM(...Object.values(ECronType)),
    comment: "执行类型",
  })
  cron_type: string;

  @Column({
    type: DataType.ENUM(...Object.values(EReportSenderType)),
    comment: "图表展示类型",
  })
  sender_type: string;

  @Column({ type: DataType.TEXT, comment: "外发配置JSON" })
  sender_options: string;

  @Column({ type: DataType.STRING, comment: "备注信息" })
  description: string;

  @Column({
    type: DataType.STRING,
    comment: "全局时间范围",
  })
  global_time_range: string;

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
