import { Inject, Logger, Provide } from "@midwayjs/decorator";
import { IMidwayLogger } from "@midwayjs/logger";
import * as mailer from "nodemailer";
import * as smtpTransport from "nodemailer-smtp-transport";
import { GlobalService } from "./global";
import Mail = require("nodemailer/lib/mailer");

@Provide()
export class MailService {
  @Logger()
  readonly logger: IMidwayLogger;

  @Inject()
  globalService: GlobalService;

  /**
   * 发送邮件
   * @param data 邮件内容
   */
  async sendSMTPMail(data: Mail.Options) {
    const { logger } = this;

    // 获取邮箱配置
    const mailConfig = await this.globalService.getMailConfig();
    if (!mailConfig || !mailConfig.effective) {
      logger.error("[send mail] send mail error: SMTP is not configured.");
      throw new Error("SMTP is not configured.");
    }

    data.from = `${mailConfig.mail_username || mailConfig.login_user} <${
      mailConfig.mail_address
    }>`;
    const smtpInfo = {
      host: mailConfig.host,
      port: mailConfig.port,
      auth: {
        user: mailConfig.login_user,
        pass: mailConfig.login_password,
      },
      secure: mailConfig.secure,
      ignoreTLS: true,
      tls: {
        rejectUnauthorized: false,
      },
    }
    logger.info(`发送定时任务,SMTP配置: ${JSON.stringify(smtpInfo)}`);
    const transporter = mailer.createTransport(
      smtpTransport(smtpInfo)
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
