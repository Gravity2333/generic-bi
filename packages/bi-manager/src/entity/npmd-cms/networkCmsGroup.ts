import { EntityModel } from "@midwayjs/orm";
import { Column } from "typeorm";
import { NpmdNetwork } from "../npmd/network";

// NPMD-网络组
@EntityModel("fpccms_appliance_sensor_network_group", {
  connectionName: "npmd-cms",
})


export class NpmdCmsNetworkGroup extends NpmdNetwork {
  @Column()
  network_in_sensor_ids?: string;
}
