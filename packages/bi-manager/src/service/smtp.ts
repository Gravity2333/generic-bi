import { Inject, Logger, Provide } from "@midwayjs/decorator";
import { Context } from "egg";
import { IMidwayLogger } from "@midwayjs/logger";
import SMTPModel from "../model/smtp";
import { UpdateSMTPInput } from "../dto/smtp.dto";
import * as mailer from "nodemailer";
import * as smtpTransport from "nodemailer-smtp-transport";
import Mail = require("nodemailer/lib/mailer");

@Provide()
export class SMTPService {
  @Inject()
  ctx: Context;

  @Logger()
  readonly logger: IMidwayLogger;

  async getConfig(): Promise<SMTPModel> {
    const { rows } = await SMTPModel.findAndCountAll();
    return rows[0] || ({} as any);
  }

  async setConfig(config: UpdateSMTPInput) {
    const id = config.id;
    if (config.id) {
      const target = await SMTPModel.findByPk(id);
      if (!target) {
        this.ctx?.throw(404, "SMTP配置未找到！");
      }
      await target.update(config);
      this.logger.info("[SMTP]配置更新");
      return;
    }
    this.logger.info("[SMTP]配置更新");
    //@ts-ignore
    return await SMTPModel.create(config);
  }

  async validate() {
    const { rows } = await SMTPModel.findAndCountAll();
    if (!rows[0]) return false;
    return await new Promise((resolve) => {
      const mailconfig = rows[0];
      // 创建SMTP传输配置
      const smtpConfig = {
        host: mailconfig.smtp_server, // SMTP服务器地址
        port: mailconfig.server_port, // SMTP端口
        secure: mailconfig.encrypt, // 如果端口是465，则设置为true，否则设置为false
        auth: {
          user: mailconfig.login_user, // SMTP登录用户名
          pass: mailconfig.login_password, // SMTP登录密码
        },
      };

      // 创建Nodemailer传输器
      const transporter = mailer.createTransport(smtpConfig as any);
      // 发送测试邮件以检测SMTP服务器有效性
      transporter.verify((error) => {
        if (error) {
          resolve(false);
        } else {
          resolve(true);
        }
      });
    });
  }

  async validateByParams(config: UpdateSMTPInput) {
    return await new Promise((resolve) => {
      // 创建SMTP传输配置
      const smtpConfig = {
        host: config?.smtp_server, // SMTP服务器地址
        port: config?.server_port, // SMTP端口
        secure: config?.encrypt, // 如果端口是465，则设置为true，否则设置为false
        auth: {
          user: config?.login_user, // SMTP登录用户名
          pass: config?.login_password, // SMTP登录密码
        },
      };

      // 创建Nodemailer传输器
      const transporter = mailer.createTransport(smtpConfig as any);

      // 发送测试邮件以检测SMTP服务器有效性
      transporter.verify((error) => {
        if (error) {
          console.log(error);
          resolve(false);
        } else {
          resolve(true);
        }
      });
    });
  }

    /**
   * 发送邮件
   * @param data 邮件内容
   */
    async sendSMTPMail(data: Mail.Options) {
      const { logger } = this;
  
      // 获取邮箱配置
      const mailConfig = await this.getConfig()
      if (!mailConfig || !await this.validate()) {
        logger.error("[send mail] send mail error: SMTP is not configured.");
        throw new Error("SMTP is not configured.");
      }
  
      data.from = `${mailConfig.mail_username || mailConfig.login_user} <${
        mailConfig.mail_address
      }>`;
      const smtpInfo = {
        host: mailConfig.smtp_server,
        port: mailConfig.server_port,
        auth: {
          user: mailConfig.login_user,
          pass: mailConfig.login_password,
        },
        secure: mailConfig.encrypt,
        ignoreTLS: true,
        tls: {
          rejectUnauthorized: false,
        },
      }
      logger.info(`发送定时任务,SMTP配置: ${JSON.stringify(smtpInfo)}`);
      const transporter = mailer.createTransport(
        smtpTransport(smtpInfo as any)
      );
      transporter.sendMail(data, (err, info) => {
        if (err) {
          logger.error("[send mail] send mail error", err, data);
          throw new Error(err.message);
        }
        logger.info("[send mail] send mail success", data);
        return;
      });
    }
  
    /**
     * 发送定时报表 PDF 邮件
     * @param toAddress 接收人地址
     * @param subject 邮件主题
     * @param content 邮件正文内容
     * @param attachments 附件列表
     */
    async sendMail(
      toAddress: string[],
      subject: string,
      content?: string,
      attachments?: Mail.Attachment[]
    ) {
      const to = toAddress.join(",");
      const html = content || "";
      await this.sendSMTPMail({
        to,
        subject,
        html,
        attachments,
      });
    }
}
