import { EntityModel } from "@midwayjs/orm";
import { NpmdCustomSaSubcategory } from "../npmd/saCustomSubcategory";
import { EBIVERSION } from "@bi/common";

const isCms = process.env.BI_VERSION === EBIVERSION.CMS;

@EntityModel(isCms?"fpccms_appliance_sa_subcategory":"fpc_appliance_sa_subcategory", { connectionName: "npmd-cms" })
export class NpmdCmsCustomSaSubcategory extends NpmdCustomSaSubcategory {}
