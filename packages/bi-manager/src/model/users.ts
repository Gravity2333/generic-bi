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

@BaseTable({ tableName: "bi_users" })
export default class Users extends Model {
  @IsUUID(4)
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column({ type: DataType.UUIDV4, comment: "ID" })
  id: string;

  @Column({ type: DataType.STRING, comment: "用户名" })
  username: string;

  @Column({ type: DataType.STRING, comment: "密码" })
  password: string;

  @Column({ type: DataType.STRING, comment: "角色" })
  role: string;

  @Column({ type: DataType.STRING, comment: "昵称" })
  nickname: string;

  @Column({ type: DataType.STRING, comment: "头像" })
  avator: string;

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
