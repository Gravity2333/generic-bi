import { EntityModel } from "@midwayjs/orm";
import { NpmdCustomSaApplication } from "../npmd/customSaApplication";
import { EBIVERSION } from "@bi/common";

const isCms = process.env.BI_VERSION === EBIVERSION.CMS;

@EntityModel(isCms?"fpccms_appliance_sa_application":"fpc_appliance_sa_application", { connectionName: "npmd-cms" })
export class NpmdCmsCustomSaApplication extends NpmdCustomSaApplication {}
