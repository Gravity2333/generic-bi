import {
  ALL,
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Post,
  Provide,
} from "@midwayjs/decorator";
import { Context } from "@midwayjs/web";
import { CreateUserInput, LoginInput } from "../dto/users.dto";
import { UsersService } from "../service/users";
import { Utils } from "../utils";
const formidable = require("formidable");
import * as fs from "fs";

@Provide()
@Controller("/web-api/v1")
export class UsersController {
  @Inject()
  usersService: UsersService;

  @Inject()
  ctx: Context;

  @Inject()
  utils: Utils;

  @Post("/register")
  async register(@Body(ALL) registerParams: CreateUserInput) {
    return this.usersService.register(registerParams);
  }

  @Post("/login")
  async login(@Body(ALL) registerParams: LoginInput) {
    return this.usersService.login(registerParams);
  }

  @Post("/change-password")
  async changePassword(
    @Body(ALL)
    registerParams: {
      username: string;
      password: string;
      oldPassword: string;
    }
  ) {
    return this.usersService.changePassword(registerParams);
  }

  @Post("/change-nickname")
  async changeNickName(
    @Body(ALL)
    { nickname }: { nickname: string }
  ) {
    return await this.usersService.changeNickname(
      this.ctx.userInfo.username,
      nickname
    );
  }

  @Get("/current-user")
  async querCurrentUserInfo() {
    const ctxInfo = await this.ctx.userInfo;
    const { username } = ctxInfo;
    if (!username) {
      return this.ctx?.throw(500, "未授权用户！");
    }
    const info = await this.usersService.getUserInfoByUsername(username);
    const themeColor = await this.utils.themeColorService.get(username);
    return {
      ...ctxInfo,
      ...info,
      themeColor
    };
  }

  @Post("/login/timeout")
  async setTimeout(@Body(ALL) { timeout }: { timeout: number }) {
    return await this.utils.jwtTimeoutService.set(timeout);
  }

  @Get("/login/timeout")
  async getTimeout() {
    return await this.utils.jwtTimeoutService.get();
  }

  @Post("/avator/:username/as-import")
  async importBackground(@Param() username: string) {
    try {
      const form = formidable({ multiples: true });
      const { success, info } = await new Promise<{
        success: boolean;
        info: Buffer;
      }>((resolve, reject) => {
        form.parse(this.ctx.req, async (error, fields, { file }) => {
          if (error) {
            reject({ success: false, info: error });
          }
          const fileContext = fs.readFileSync(file.filepath);
          resolve({ success: true, info: fileContext });
        });
      });
      if (!success) {
        throw new Error("上传错误");
      }
      this.usersService.importAvator(username, info);
    } catch (error) {
      this.ctx?.throw(500, error);
    }
  }
}
