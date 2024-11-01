import { EntityModel } from "@midwayjs/orm";
import { NpmdCommonColumns } from "./commonColumns";
import { Column } from "typeorm";

// NPMD-主网
@EntityModel("fpc_appliance_network", { connectionName: "npmd-cms" })
export class NpmdNetwork extends NpmdCommonColumns {
  @Column()
  // 网络 ID
  id: string;

  @Column()
  // 网络名
  name: string;
}
