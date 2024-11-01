import { EntityModel } from "@midwayjs/orm";
import { Column, Generated, PrimaryColumn } from "typeorm";
import { EBooleanString } from "../../interface";
import { EBIVERSION } from "@bi/common";

const isCms = process.env.BI_VERSION === EBIVERSION.CMS;

@EntityModel(
  isCms
    ? "fpccms_appliance_smtp_configuration"
    : "fpc_appliance_smtp_configuration",
  {
    connectionName: "npmd-cms",
  }
)
export class NpmdCmsSmtp {
  @PrimaryColumn()
  @Generated("uuid")
  id: string;

  // 用户名
  @Column()
  mail_username: string;

  // 邮件地址
  @Column()
  mail_address: string;

  // 邮件服务器
  @Column()
  smtp_server: string;

  // 服务器端口
  @Column()
  server_port: number;

  // 是否加密（0：不加密；1：加密）
  @Column({
    type: "enum",
    enum: EBooleanString,
    default: EBooleanString.False,
  })
  encrypt: EBooleanString;

  // 是否加密（0：不加密；1：加密）
  @Column({
    type: "enum",
    enum: EBooleanString,
    default: EBooleanString.False,
  })
  msg_encrypt: EBooleanString;

  // 登录用户
  @Column()
  login_user: string;

  // 登录密码
  @Column()
  login_password: string;

  // 是否删除
  @Column({
    type: "enum",
    enum: EBooleanString,
    default: EBooleanString.False,
  })
  deleted: EBooleanString;

  @Column("timestamp with time zone", { name: "create_time", nullable: true })
  create_time: Date | null;
}
