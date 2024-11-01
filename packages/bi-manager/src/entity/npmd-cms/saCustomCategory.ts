import { EntityModel } from "@midwayjs/orm";
import { NpmdCustomSaCategory } from "../npmd/saCustomCategory";
import { EBIVERSION } from "@bi/common";

const isCms = process.env.BI_VERSION === EBIVERSION.CMS;

@EntityModel(isCms?"fpccms_appliance_sa_category":"fpc_appliance_sa_category", { connectionName: "npmd-cms" })
export class NpmdCmsCustomSaCategory extends NpmdCustomSaCategory {}
