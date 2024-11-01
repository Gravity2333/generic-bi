import {
  ALL,
  Body,
  Controller,
  Del,
  Get,
  Inject,
  Param,
  Post,
  Provide,
  Put,
  Query,
  Validate,
} from "@midwayjs/decorator";
import {
  CreateNpmdDictInput,
  QueryNpmdDictInput,
  QueryNpmdDictMappingInput,
} from "../dto/npmDict.dto";
import { NpmdDictService } from "../service/npmdDict";
import { NpmdDictMappingService } from "./../service/npmdDictMapping";
import { NetworkService } from "../service/network";

@Provide()
@Controller("/web-api/v1")
export class NpmdAPIController {
  @Inject()
  npmdDictService: NpmdDictService;

  @Inject()
  networkService: NetworkService;

  @Inject()
  npmdDictMappingService: NpmdDictMappingService;

  
  @Get("/npmd/dicts")
  @Validate()
  async listNpmdDicts(@Query(ALL) { forceFlush }: QueryNpmdDictInput) {
    return this.npmdDictService.queryDicts(forceFlush);
  }

  @Get("/npmd/dicts/network-groups")
  async listNpmdNetworkGroupsDicts() {
    return this.networkService.listAllNetworkGroups();
  }

  @Get("/npmd/dict-mappings")
  @Validate()
  async listDictMappings(
    @Query(ALL) { table_name }: QueryNpmdDictMappingInput
  ) {
    const { dictMappingList } =
      await this.npmdDictMappingService.listDictMappingByTableName(table_name);

    return dictMappingList;
  }

  @Get("/npmd/dict-mappings/:id")
  async getReportById(@Param() id: string) {
    const mapping = await this.npmdDictMappingService.getDictMappingById(id);
    return mapping ?? {};
  }

  @Post("/npmd/dict-mappings")
  @Validate()
  async createReport(@Body(ALL) createParam: CreateNpmdDictInput) {
    return await this.npmdDictMappingService.createDictMapping(createParam);
  }

  @Put("/npmd/dict-mappings/:id")
  @Validate()
  async updateReport(
    @Param() id: string,
    @Body(ALL) updateParam: CreateNpmdDictInput
  ) {
    return await this.npmdDictMappingService.updateDictMapping({
      ...updateParam,
      id,
    });
  }

  @Del("/npmd/dict-mappings/:id")
  async deleteReport(@Param() id: string) {
    return await this.npmdDictMappingService.deleteDictMapping(id);
  }
}
