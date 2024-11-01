import { EntityModel } from "@midwayjs/orm";
import { NpmdCommonColumns } from "./commonColumns";

// NPMD-逻辑子网
@EntityModel("fpc_appliance_logical_subnet", { connectionName: "npmd" })
export class NpmdLogicalSubnet extends NpmdCommonColumns {}
