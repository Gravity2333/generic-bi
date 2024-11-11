import {
  ALL,
  Body,
  Config,
  Controller,
  Get,
  Inject,
  Post,
  Provide,
  Validate,
} from "@midwayjs/decorator";
import { Context } from "@midwayjs/web";
import { Utils } from "../utils";
const formidable = require("formidable");
import * as fs from "fs";
import { IMyAppConfig } from "../interface";
import {v4 as uuidv4} from 'uuid'

@Provide()
@Controller("/web-api/v1")
export class LayoutController {
  @Inject()
  ctx: Context;

  @Config("backgrounds")
  backgroundsPath: IMyAppConfig["background"];

  @Config("asset_uri")
  asset_uri: IMyAppConfig["asset_uri"];

  @Inject()
  utils: Utils;

  @Post("/layout/title")
  async setTitle(@Body(ALL) { title }: { title: string }) {
    return await this.utils.sysTitleService.set(title);
  }

  @Get("/layout/title")
  async getTitle() {
    return await this.utils.sysTitleService.get();
  }

  @Post("/background/as-import")
  @Validate()
  async importBackground() {
    try {
      const form = formidable({ multiples: true });
      const { success, info,ext } = await new Promise<{
        success: boolean;
        info: any;
        ext: string,
      }>((resolve, reject) => {
        form.parse(this.ctx.req, async (error, fields, { file }) => {
          if (error) {
            reject({ success: false, info: error });
          }
          const fileContext = fs.readFileSync(file.filepath);
          resolve({ success: true, info: fileContext,ext: file.originalFilename?.split(".")[1] });
        });
      });
      if (!success) {
        throw new Error(info);
      } else {
        /** 目标文件夹路径 */
        const backgroundsPath = this.backgroundsPath;
        fs.writeFileSync(
          `${backgroundsPath}/${uuidv4()}.${ext}`,
          Buffer.from(info)
        );
      }
    } catch (error) {
      this.ctx?.throw(500, error);
    }
  }

  
  @Get("/background/urls")
  async getBackgroundUrls() {
    const prefix = this.asset_uri
    const backgroundsPath = this.backgroundsPath;
    const fileList = fs.readdirSync(`${backgroundsPath}`)
    return fileList.map(url=>prefix+`/resources/backgrounds/${url}`)
  }
}
