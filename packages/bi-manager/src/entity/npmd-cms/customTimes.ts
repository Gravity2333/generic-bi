import { EntityModel } from "@midwayjs/orm";
import { EBIVERSION } from "@bi/common";
import { NpmdCustomTimes } from "../npmd/customTimes";

const isCms = process.env.BI_VERSION === EBIVERSION.CMS;

@EntityModel(
  isCms ? "fpccms_appliance_custom_time" : "fpc_appliance_custom_time",
  { connectionName: "npmd-cms" }
)
export class NpmdCmsCustomTimes extends NpmdCustomTimes {}
