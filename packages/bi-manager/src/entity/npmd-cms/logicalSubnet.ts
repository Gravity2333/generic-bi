import { EntityModel } from "@midwayjs/orm";
import { NpmdLogicalSubnet } from "../npmd/logicalSubnet";
import { EBIVERSION } from "@bi/common";

const isCms = process.env.BI_VERSION === EBIVERSION.CMS;

// NPMD-逻辑子网
@EntityModel(
  isCms ? "fpccms_appliance_sensor_logical_subnet" : "fpc_appliance_logical_subnet",
  {
    connectionName: "npmd-cms",
  }
)
export class NpmdCmsLogicalSubnet extends NpmdLogicalSubnet {}
