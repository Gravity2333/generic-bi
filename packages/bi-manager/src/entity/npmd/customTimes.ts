import { EntityModel } from "@midwayjs/orm";
import { NpmdCommonColumns } from "./commonColumns";
import { Column } from "typeorm";

// NPMD-主网
@EntityModel("fpc_appliance_custom_time", { connectionName: "npmd-cms" })
export class NpmdCustomTimes extends NpmdCommonColumns {
  @Column()
  id: string;

  @Column()
  name: string;

  @Column()
  type: number;

  @Column()
  period: string;

  @Column()
  custom_time_setting: string;
}
