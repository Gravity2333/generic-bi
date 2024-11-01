import { Config, Inject, Logger, Provide } from "@midwayjs/decorator";
import { IMyAppConfig } from "../interface";
import { HttpService } from "@midwayjs/axios";
import { IMidwayLogger } from "@midwayjs/logger";
import * as crypto from "crypto";
import * as https from "https";
import { INpmdRestApiResult } from "../interface/npmd";
import { EBIVERSION } from "@bi/common";
const isDev = process.env.NODE_ENV === "local";
const isCms = process.env.BI_VERSION === EBIVERSION.CMS;

@Provide()
export class RestApiService {
  @Config("restapi")
  restapiConfig: IMyAppConfig["restapi"];

  @Inject()
  httpService: HttpService;

  @Logger()
  readonly logger: IMidwayLogger;

  private _generateSignature(key: string) {
    return crypto.createHash("sha512").update(key).digest("hex");
  }

  private _handleError(error: string) {
    this.logger.error(error);
    throw new Error(error);
  }

  private _generateCompleteUrl(uri: string) {
    const { url_origin } = this.restapiConfig;
    return `${url_origin}${
      isDev ? uri.replace(isCms ? "/center" : "/manager", "") : uri
    }`;
  }

  public async get<T>(uri: string) {
    const { url_origin, app_key, app_token } = this.restapiConfig;
    if (!url_origin || !app_key || !app_token) {
      this._handleError(
        "[npmd-restapi] npm restapi error: app_key or app_token is empty"
      );
    }

    const timestamp = new Date().valueOf();

    // 生成签名
    const signature = this._generateSignature(
      [app_key, app_token, timestamp].sort().join("")
    );

    const restApiUrl = this._generateCompleteUrl(uri);

    try {
      const result = await this.httpService.get<INpmdRestApiResult<T>>(
        restApiUrl,
        {
          httpsAgent: new https.Agent({
            rejectUnauthorized: false,
          }),
          headers: {
            appKey: app_key,
            timestamp,
            signature,
          },
        }
      );
 
      if (typeof result.data !== "object" || result.data.code === undefined) {
        return result.data;
      }

      if (result.data.code !== 0) {
        this._handleError(`[npmd-restapi]: request [${restApiUrl}] error`);
      }

      return result.data.result;
    } catch (error) {
      throw new Error(error);
    }
  }

  public async post<T>(uri: string, data?: any) {
    const { url_origin, app_key, app_token } = this.restapiConfig;
    if (!url_origin || !app_key || !app_token) {
      this._handleError(
        "[npmd-restapi] npm restapi error: app_key or app_token is empty"
      );
    }

    const timestamp = new Date().valueOf();

    // 生成签名
    const signature = this._generateSignature(
      [app_key, app_token, timestamp].sort().join("")
    );

    const restApiUrl = this._generateCompleteUrl(uri);
    try {
      const result = await this.httpService.post<INpmdRestApiResult<T>>(
        restApiUrl,
        data,
        {
          httpsAgent: new https.Agent({
            rejectUnauthorized: false,
          }),
          headers: {
            appKey: app_key,
            timestamp,
            signature,
          },
        }
      );

      // console.log(result.data);
      if (typeof result.data !== "object" || result.data.code === undefined) {
        return result.data;
      }

      if (result.data.code !== 0) {
        this._handleError(`[npmd-restapi]: request [${restApiUrl}] error`);
      }

      return result.data.result;
    } catch (error) {
      throw new Error(error);
    }
  }
}
