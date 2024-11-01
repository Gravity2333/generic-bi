import { EntityModel } from "@midwayjs/orm";
import { Column } from "typeorm";
import { NpmdCommonColumns } from "./commonColumns";

@EntityModel("fpc_appliance_sa_application", { connectionName: "npmd" })
export class NpmdCustomSaApplication extends NpmdCommonColumns {
  @Column()
  application_id: string;

  @Column()
  category_id: string;

  @Column()
  sub_category_id: string;
}
