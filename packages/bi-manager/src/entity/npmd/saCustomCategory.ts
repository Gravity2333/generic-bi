import { EntityModel } from "@midwayjs/orm";
import { Column } from "typeorm";
import { NpmdCommonColumns } from "./commonColumns";

@EntityModel("fpc_appliance_sa_category", { connectionName: "npmd" })
export class NpmdCustomSaCategory extends NpmdCommonColumns {
  @Column()
  category_id: string;
}
