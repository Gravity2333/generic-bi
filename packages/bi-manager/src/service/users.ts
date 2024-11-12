import { Inject, Logger, Provide } from "@midwayjs/decorator";
import { Context } from "egg";
import { IMidwayLogger } from "@midwayjs/logger";
import UsersModel from "../model/users";
import { CreateUserInput, LoginInput } from "../dto/users.dto";
import { Op } from "sequelize";
import { JwtService } from "./jwt";

@Provide()
export class UsersService {
  @Inject()
  ctx: Context;

  @Inject()
  jwtService: JwtService;

  @Logger()
  readonly logger: IMidwayLogger;

  async register(userInfo: CreateUserInput): Promise<any> {
    const { username } = userInfo;
    const { rows } = await UsersModel.findAndCountAll({
      where: {
        username: { [Op.eq]: username },
      },
    });

    if (rows?.length > 0) {
      // 存在同名用户，报错
      this.ctx?.throw(500, "注册失败，用户名重复！");
    }
    try {
      // 保存用户
      await UsersModel.create(userInfo as any);
      this.logger.info(`[注册] 新增用户 ${username}`);
      return;
    } catch (err) {
      this.logger.error(`[注册] 新增用户 ${username} 失败!`);
      this.ctx?.throw(500, "注册失败！");
    }
  }

  async login(userInfo: LoginInput) {
    const { username, password } = userInfo;
    const { rows } = await UsersModel.findAndCountAll({
      where: {
        username: { [Op.eq]: username },
      },
    });
    if (!rows[0]) {
      this.ctx?.throw(500, "用户不存在！");
    }
    if (rows[0].password === password) {
      this.logger.info(`[登录] 用户 ${username} 登录成功!`);
      return {
        jwtToken: await this.jwtService.generateToken({
          username,
          fullname: rows[0].nickname,
          loginTime: +new Date(),
        }),
      };
    } else {
      this.ctx?.throw(500, "密码错误！");
    }
  }

  async changePassword(userInfo: {
    username: string;
    password: string;
    oldPassword: string;
  }) {
    const { username, password, oldPassword } = userInfo;
    const { rows } = await UsersModel.findAndCountAll({
      where: {
        username: { [Op.eq]: username },
      },
    });
    if (!rows[0]) {
      this.ctx?.throw(500, "用户不存在！");
    }
    if (rows[0].password === oldPassword) {
      this.logger.info(`[修改密码] 用户 ${username} 修改密码成功!`);
      return await rows[0].update({
        ...rows[0],
        password,
      });
    } else {
      this.ctx?.throw(500, "密码错误！");
    }
  }
}
