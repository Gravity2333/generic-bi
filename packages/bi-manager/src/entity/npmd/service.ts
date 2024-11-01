import { EntityModel } from "@midwayjs/orm";
import { NpmdCommonColumns } from "./commonColumns";

@EntityModel("fpc_appliance_service", { connectionName: "npmd" })
export class NpmdService extends NpmdCommonColumns {}
