import { EVisualizationType } from "@bi/common";
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

@BaseTable({ tableName: "bi_widget" })
export default class Widget extends Model {
  @IsUUID(4)
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column({ type: DataType.UUIDV4, comment: "ID" })
  id: string;

  @Column({ type: DataType.STRING, comment: "名称" })
  name: string;

  @Column({ type: DataType.STRING, comment: "数据库" })
  database: string;

  @Column({ type: DataType.STRING, comment: "数据源" })
  datasource: string;

  @Column({
    type: DataType.ENUM(...Object.values(EVisualizationType)),
    comment: "图表展示类型",
  })
  viz_type: string;

  @Column({ type: DataType.TEXT, comment: "图表配置JSON" })
  specification: string;

  @Column({ type: DataType.STRING, comment: "备注信息" })
  description: string;

  @Column({ type: DataType.STRING, comment: "模板", defaultValue: "0" })
  template?: string;

  @Column({ type: DataType.STRING, comment: "只读", defaultValue: "0" })
  readonly?: string;

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
