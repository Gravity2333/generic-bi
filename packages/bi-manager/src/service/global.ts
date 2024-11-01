import { EBIVERSION, IMailConfig, IUserInfo } from "@bi/common";
import { Config, Inject, Provide } from "@midwayjs/decorator";
import { InjectEntityModel } from "@midwayjs/orm";
import { Repository } from "typeorm";
import { NpmdCmsSmtp } from "../entity/npmd-cms/smtp";
import { EBooleanString, IMyAppConfig } from "../interface";
import { NPMD_CMS_TABLE } from "./npmdDict";
import { RestApiService } from "./restApi";
import { TimerCache } from "../utils/timerCache";

const CryptoJS = require("crypto-js");
const isCms = process.env.BI_VERSION === EBIVERSION.CMS;

function decrypt(data) {
  const key = CryptoJS.enc.Utf8.parse("Machloop@123456!");
  const iv = CryptoJS.enc.Utf8.parse("aabbccddeeffgghh");
  const decrypt = CryptoJS.AES.decrypt(data, key, {
    iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  }).toString(CryptoJS.enc.Utf8);
  return decrypt;
}

/** 用户信息缓存， Expire Time 30s */
const userInfoCache = new TimerCache<IUserInfo>(30000);

@Provide()
export class GlobalService {
  @Config("mail_opts")
  mailConfig: IMyAppConfig["mail_opts"];

  @Config("mode")
  modeConfig: IMyAppConfig["mode"];

  @Inject()
  restapiService: RestApiService;

  @InjectEntityModel(NpmdCmsSmtp, NPMD_CMS_TABLE)
  npmdCmsSmtpModel: Repository<NpmdCmsSmtp>;
  /**
   * 生成固定的 jwt token
   * @returns jwt token
   */
  async getMailConfig() {
    let mailConfig = <IMailConfig>{};

    // 内嵌部署时直接调用外部接口
    if (this.modeConfig !== "embed") {
      // 查询一条未删除的配置
      let find =
        (await this.npmdCmsSmtpModel.findOne({
          where: {
            deleted: EBooleanString.False,
          },
          order: { create_time: "DESC" },
        })) || ({} as NpmdCmsSmtp);

      if (find.msg_encrypt === "1") {
        // 解密
        // 填充是否加密字段
        mailConfig = {
          host: find?.smtp_server,
          port: find?.server_port,
          mail_address: decrypt(find.mail_address),
          mail_username: find.mail_username,
          login_password: decrypt(find.login_password),
          login_user: find.login_user,
          secure: find.encrypt === EBooleanString.True,
          // 先默认填充，下面会统一设置此参数
          effective: true,
        };
      } else {
        // 填充是否加密字段
        mailConfig = {
          host: find?.smtp_server,
          port: find?.server_port,
          mail_address: find.mail_address,
          mail_username: find.mail_username,
          login_password: find.login_password,
          login_user: find.login_user,
          secure: find.encrypt === EBooleanString.True,
          // 先默认填充，下面会统一设置此参数
          effective: true,
        };
      }
    } else {
      // 单机部署模式下，取本地的配置
      mailConfig.host = this.mailConfig?.host;
      mailConfig.port = this.mailConfig?.port;
      mailConfig.mail_address = this.mailConfig?.auth?.user;
      mailConfig.mail_username = this.mailConfig?.display_name;
      mailConfig.login_user = this.mailConfig?.auth?.user;
      mailConfig.login_password = this.mailConfig?.auth?.pass;
      mailConfig.secure = this.mailConfig.secure;
    }

    if (
      mailConfig.host !== undefined &&
      mailConfig.port !== undefined &&
      mailConfig.login_user !== undefined &&
      mailConfig.login_password !== undefined &&
      mailConfig.mail_address !== undefined &&
      mailConfig.mail_username !== undefined
    ) {
      mailConfig.effective = true;
    } else {
      mailConfig.effective = false;
    }

    return mailConfig;
  }

  /** 解析token */
  public async parseToken(token) {
    return await userInfoCache.fetchIfNoExist(token, async () => {
      try {
        const parsedToken = (await this.restapiService.get<IUserInfo>(
          isCms
            ? `/center/restapi/v1/system/bi/parse-token?token=${token}`
            : `/manager/restapi/v1/system/bi/parse-token?token=${token}`
        )) as IUserInfo;
        return parsedToken as IUserInfo;
      } catch (e) {
        throw new Error(e);
      }
    });
  }
}
