import { EntityModel } from "@midwayjs/orm";
import { NpmdCommonColumns } from "./commonColumns";

// NPMD-IP 地址组
@EntityModel("fpc_appliance_host_group", { connectionName: "npmd" })
export class NpmdHostGroup extends NpmdCommonColumns {}
