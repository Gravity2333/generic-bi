import { EntityModel } from "@midwayjs/orm";
import { Column } from "typeorm";
import { NpmdNetwork } from "../npmd/network";

// NPMD-网络组
@EntityModel("fpc_appliance_network_group", {
  connectionName: "npmd-cms",
})
export class NpmdNetworkGroup extends NpmdNetwork {
  @Column()
  network_ids?: string;
}
