import {
  ALL,
  Controller,
  Get,
  Inject,
  Provide,
  Query,
} from "@midwayjs/decorator";
import { Context } from "egg";
import { ClickHouseService } from "../service/clickhouse";
import { NpmdDictService } from "../service/npmdDict";
import { GlobalService } from "./../service/global";

@Provide()
@Controller("/web-api/v1")
export class ApiController {
  @Inject()
  ctx: Context;

  @Inject()
  globalService: GlobalService;

  @Inject()
  clickhouseService: ClickHouseService;

  @Inject()
  npmdDictService: NpmdDictService;


  @Get("/mail-configs")
  async queryMailConfig() {
    const mapping = await this.globalService.getMailConfig();
    // 删除密码
    delete mapping?.login_password;
    return mapping ?? {};
  }

  @Get("/current-user")
  async querCurrentUserInfo(
    @Query(ALL)
    { token }: { token: string }
  ) {
    return await this.globalService.parseToken(token);
  }

  @Get("/*")
  async Error404() {
    return this.ctx?.throw(404, `[API Not Found] ${this.ctx.request.URL}`);
  }
}
