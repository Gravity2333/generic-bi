import { EntityModel } from "@midwayjs/orm";
import { Column } from "typeorm";
import { NpmdCommonColumns } from "./commonColumns";

@EntityModel("fpc_appliance_geoip_country", { connectionName: "npmd" })
export class NpmdCustomGeoCountry extends NpmdCommonColumns {
  @Column()
  country_id: string;

  @Column()
  name: string;
}
