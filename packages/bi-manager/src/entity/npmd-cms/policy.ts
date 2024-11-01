import { EntityModel } from "@midwayjs/orm";
import { NpmdPolicy } from "../npmd/policy";

@EntityModel("fpc_appliance_forward_policy", { connectionName: "npmd-cms" })
export class NpmdCmsPolicy extends NpmdPolicy {}
