import {
  ALL,
  Body,
  Controller,
  Get,
  Inject,
  Post,
  Provide,
} from "@midwayjs/decorator";
import { Context } from "@midwayjs/web";
import { CreateUserInput, LoginInput } from "../dto/users.dto";
import { UsersService } from "../service/users";

@Provide()
@Controller("/web-api/v1")
export class UsersController {
  @Inject()
  usersService: UsersService;

  @Inject()
  ctx: Context;

  @Post("/register")
  async register(@Body(ALL) registerParams: CreateUserInput) {
    return this.usersService.register(registerParams);
  }

  @Post("/login")
  async login(@Body(ALL) registerParams: LoginInput) {
    return this.usersService.login(registerParams);
  }

  @Get("/current-user")
  async querCurrentUserInfo() {
    return await this.ctx.userInfo
  }

}
