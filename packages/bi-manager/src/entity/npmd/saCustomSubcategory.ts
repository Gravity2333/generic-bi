import { EntityModel } from "@midwayjs/orm";
import { Column } from "typeorm";
import { NpmdCommonColumns } from "./commonColumns";

@EntityModel("fpc_appliance_sa_subcategory", { connectionName: "npmd" })
export class NpmdCustomSaSubcategory extends NpmdCommonColumns {
  @Column()
  sub_category_id: string;

  @Column()
  category_id: string;
}
