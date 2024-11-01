import { EntityModel } from "@midwayjs/orm";
import { Column, PrimaryColumn } from "typeorm";
import { NpmdNetwork } from "../npmd/network";
import { EBIVERSION } from "@bi/common";

const isCms = process.env.BI_VERSION === EBIVERSION.CMS;

// NPMD-主网
@EntityModel(
  isCms ? "fpccms_appliance_sensor_network" : "fpc_appliance_network",
  {
    connectionName: "npmd-cms",
  }
)
export class NpmdCmsNetwork extends NpmdNetwork {
  @Column()
  // 网络 ID
  network_in_sensor_id: string;
}

@EntityModel(isCms ? "fpccms_central_fpc_network" : "fpc_central_fpc_network", {
  connectionName: "npmd-cms",
})
export class NpmdCmsCentral {
  @Column()
  @PrimaryColumn()
  id: string;
  @Column()
  fpc_network_id: string;
  @Column()
  // 探针名
  fpc_network_name: string;

  @Column()
  // 探针中的网络 ID
  bandwidth: number;

  @Column()
  fpc_serial_number: string;

  @Column()
  report_state: "0" | "1";

  @Column()
  report_action: "1" | "2" | "3";

  @Column()
  deleted: "0" | "1";

  @Column("timestamp with time zone", { name: "create_time", nullable: true })
  create_time: Date | null;

  @Column("timestamp with time zone", { name: "create_time", nullable: true })
  update_time: Date | null;

  @Column("timestamp with time zone", { name: "create_time", nullable: true })
  delete_time: Date | null;
  @Column()
  operator_id: string;
}
