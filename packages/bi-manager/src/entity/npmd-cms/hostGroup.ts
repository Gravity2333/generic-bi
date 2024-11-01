import { EntityModel } from "@midwayjs/orm";
import { NpmdHostGroup } from "../npmd/hostGroup";
import { EBIVERSION } from "@bi/common";

const isCms = process.env.BI_VERSION === EBIVERSION.CMS;

// NPMD CMS: IP 地址组
@EntityModel(
  isCms ? "fpccms_appliance_host_group" : "fpc_appliance_host_group",
  { connectionName: "npmd-cms" }
)
export class NpmdCmsHostGroup extends NpmdHostGroup {}
