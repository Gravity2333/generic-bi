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

@BaseTable({ tableName: "bi_dashboard" })
export default class Dashboard extends Model {
  @IsUUID(4)
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column({ type: DataType.UUIDV4, comment: "ID" })
  id: string;

  @Column({ type: DataType.STRING, comment: "名称" })
  name: string;

  // @see: https://github.com/typeorm/typeorm/blob/master/test/functional/database-schema/column-types/postgres/entity/Post.ts#L249-L250
  @Column({
    type: DataType.ARRAY(DataType.STRING),
    comment: "仪表盘中包含的图表IDs",
  })
  widget_ids: string[];

  @Column({ type: DataType.TEXT, comment: "仪表盘配置JSON" })
  specification: string;

  @Column({ type: DataType.STRING, comment: "备注信息" })
  description: string;

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
