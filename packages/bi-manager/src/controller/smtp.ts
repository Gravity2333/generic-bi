import {
  ALL,
  Body,
  Controller,
  Get,
  Inject,
  Post,
  Provide,
  Validate,
} from "@midwayjs/decorator";
import { Context } from "egg";
import { ValidationError } from "joi";
import { ELogOperareTarget, ELogOperareType } from "../service/systemLog";
import { SMTPService } from "../service/smtp";
import { UpdateSMTPInput } from "../dto/smtp.dto";

@Provide()
@Controller("/web-api/v1")
export class SMTPAPIController {
  @Inject()
  ctx: Context;

  @Inject()
  smtpService: SMTPService;

  @Get("/smtp-configuration")
  async queryDatabaseInfo() {
    return this.smtpService.getConfig();
  }

  @Get("/smtp-configuration/check")
  async checkSmtpConnect() {
    return this.smtpService.validate();
  }

  @Post("/smtp-configuration/check-by-params")
  @Validate()
  async checkSmtpByParams(@Body(ALL) createParam: UpdateSMTPInput) {
    return this.smtpService.validateByParams(createParam)
  }
  

  @Post("/smtp-configuration")
  @Validate()
  async configSmtp(@Body(ALL) createParam: UpdateSMTPInput) {
    try {
      const res = await this.smtpService.setConfig(createParam);
      if (this.ctx.sysLogger && typeof this.ctx.sysLogger === "function") {
        this.ctx.sysLogger({
          content: `配置SMTP`,
          type: ELogOperareType.CREATE,
          target: ELogOperareTarget.REPORT,
        });
      }
      return res;
    } catch (error) {
      if (error instanceof ValidationError) {
        this.ctx?.throw(500, "Params Validation Error");
      } else {
        this.ctx?.throw(500, error);
      }
    }
  }
}
