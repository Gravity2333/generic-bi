import { EntityModel } from "@midwayjs/orm";
import { NpmdCustomGeoCountry } from "../npmd/customGeoCountry";
import { EBIVERSION } from "@bi/common";

const isCms = process.env.BI_VERSION === EBIVERSION.CMS;

@EntityModel(isCms?"fpccms_appliance_geoip_country":"fpc_appliance_geoip_country", { connectionName: "npmd-cms" })
export class NpmdCmsCustomGeoCountry extends NpmdCustomGeoCountry {}
