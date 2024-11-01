import { EntityModel } from "@midwayjs/orm";
import { NpmdCommonColumns } from "./commonColumns";
import { Column } from "typeorm";

// NPMD-策略
@EntityModel("fpc_appliance_forward_policy", { connectionName: "npmd" })
export class NpmdPolicy extends NpmdCommonColumns {
  @Column()
  rule_id: string;
}
