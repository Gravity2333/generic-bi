import { Controller, Get, Inject, Provide } from "@midwayjs/decorator";
import { NetworkService } from "../service/network";

@Provide()
@Controller("/web-api/v1")
export class NetworkController {
  @Inject()
  networkService: NetworkService;

  @Get("/network/info")
  async getNetworkInfo() {
    return this.networkService.getNetworkInfo();
  }
}
