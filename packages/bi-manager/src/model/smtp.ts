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

@BaseTable({ tableName: "bi_smtp" })
export default class SMTP extends Model {
  @IsUUID(4)
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column({ type: DataType.UUIDV4, comment: "ID" })
  id: string;

  @Column({ type:  DataType.CHAR,comment: "是否加密"})
  encrypt: string;

  @Column({ type: DataType.STRING, comment: "登录密码" })
  login_password: string;

  @Column({ type: DataType.STRING, comment: "登录用户" })
  login_user: string;

  @Column({ type: DataType.STRING, comment: "邮件地址" })
  mail_address: string;

  @Column({ type: DataType.STRING, comment: "邮件名称" })
  mail_username: string;
  
  @Column({ type: DataType.NUMBER, comment: "服务端口" })
  server_port: number;

  @Column({ type: DataType.STRING, comment: "邮件服务器" })
  smtp_server: number;
  
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
