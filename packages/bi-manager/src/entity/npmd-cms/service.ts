import { EntityModel } from "@midwayjs/orm";
import { NpmdService } from "../npmd/service";
import { EBIVERSION } from "@bi/common";

const isCms = process.env.BI_VERSION === EBIVERSION.CMS;

@EntityModel(isCms?"fpccms_appliance_service":"fpc_appliance_service", { connectionName: "npmd-cms" })
export class NpmdCmsService extends NpmdService {}
