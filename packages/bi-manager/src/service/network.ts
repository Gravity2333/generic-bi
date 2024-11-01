import { EBIVERSION, INetworkInfoType, INpmdDictValueEnum } from "@bi/common";
import { Provide } from "@midwayjs/decorator";
import { InjectEntityModel } from "@midwayjs/orm";
import { Repository } from "typeorm";
import { EBooleanString } from "../interface";
import { NpmdCmsCentral, NpmdCmsNetwork } from "../entity/npmd-cms/network";
import { NpmdNetworkGroup } from "../entity/npmd-cms/networkGroup";
import { NpmdCmsLogicalSubnet } from "../entity/npmd-cms/logicalSubnet";
import { NpmdCmsNetworkGroup } from "../entity/npmd-cms/networkCmsGroup";
import { NpmdNetwork } from "../entity/npmd/network";

const isCms = process.env.BI_VERSION === EBIVERSION.CMS;

@Provide()
export class NetworkService {
  @InjectEntityModel(NpmdCmsNetwork, "npmd-cms")
  npmdCmsNetworkModel: Repository<NpmdCmsNetwork>;

  @InjectEntityModel(NpmdNetwork, "npmd-cms")
  npmdNetworkModel: Repository<NpmdNetwork>;

  @InjectEntityModel(NpmdCmsCentral, "npmd-cms")
  npmdCmsCentralModel: Repository<NpmdCmsCentral>;

  @InjectEntityModel(NpmdNetworkGroup, "npmd-cms")
  npmdNetworkGroupModel: Repository<NpmdNetworkGroup>;

  @InjectEntityModel(NpmdCmsNetworkGroup, "npmd-cms")
  npmdCmsNetworkGroupModel: Repository<NpmdCmsNetworkGroup>;

  @InjectEntityModel(NpmdCmsLogicalSubnet, "npmd-cms")
  npmdLogicalSubnetModel: Repository<NpmdCmsLogicalSubnet>;

  /** 网络信息 定时更新 */
  NPMD_NETWORK_INFO: INetworkInfoType = {
    networks: [],
    logicalSubnets: [],
    networkGroups: [],
  };

  async queryNetowrks() {
    let [networkList] = isCms
      ? await this.npmdCmsNetworkModel.findAndCount({
          where: {
            // 全查
            deleted: EBooleanString.False,
          },
          order: { create_time: "DESC" },
        })
      : await this.npmdNetworkModel.findAndCount({
          where: {
            // 全查
            deleted: EBooleanString.False,
          },
          order: { create_time: "DESC" },
        });

    if (isCms) {
      const [centralNetwork] = await this.npmdCmsCentralModel.findAndCount({
        where: {
          // 全查
          deleted: EBooleanString.False,
        },
        order: { create_time: "DESC" },
      });

      const centralNetworkMap = centralNetwork.reduce((prev, curr) => {
        return {
          ...prev,
          [curr.fpc_network_id]: curr,
        };
      }, {});

      networkList = networkList.map((n) => {
        if (!n?.name) {
          return {
            ...n,
            name: centralNetworkMap[(n as any)?.network_in_sensor_id]?.fpc_network_name || "",
          };
        }
        return n;
      });
    }

    return networkList;
  }

  /**
   * 查询 NPMD 所有网络（主网、子网）
   */
  async listAllNetworks() {
    try {
      // 物理网络
      const networkList = await this.queryNetowrks();
      // 逻辑子网
      const [logicalSubnetList] =
        await this.npmdLogicalSubnetModel.findAndCount({
          where: {
            // 全查
            deleted: EBooleanString.False,
          },
          order: { create_time: "DESC" },
        });
      // 组装信息
      const map = <INpmdDictValueEnum>{};
      networkList.forEach((el: any) => {
        map[el.network_in_sensor_id || el.id] = `${el.name}[主网络]`;
      });
      logicalSubnetList.forEach((el) => {
        map[el.id] = `${el.name}[逻辑子网]`;
      });
      return map;
    } catch (e) {
      return {};
    }
  }

  /**
   * 查询 NPMD-CMS 网络组
   */
  async listAllNetworkGroups() {
    try {
      if (isCms) {
        const [rows] = await this.npmdCmsNetworkGroupModel.findAndCount({
          where: {
            // 只查未删除的
            deleted: EBooleanString.False,
          },
          order: { create_time: "DESC" },
        });
        // 遍历，组装
        const map = <INpmdDictValueEnum>{};
        rows.forEach((el) => {
          map[el.id] = `${el.name}[网络组]`;
        });
        return map;
      } else {
        const [rows] = await this.npmdNetworkGroupModel.findAndCount({
          where: {
            // 只查未删除的
            deleted: EBooleanString.False,
          },
          order: { create_time: "DESC" },
        });
        // 遍历，组装
        const map = <INpmdDictValueEnum>{};
        rows.forEach((el) => {
          map[el.id] = `${el.name}[网络组]`;
        });
        return map;
      }
    } catch (e) {
      return {};
    }
  }

  /** 更新网络信息 */
  async getNetworkInfo() {
    try {
      // 物理网络
      const networkList = await this.queryNetowrks();
      // 逻辑子网
      const [logicalSubnetList] =
        await this.npmdLogicalSubnetModel.findAndCount({
          where: {
            // 全查
            deleted: EBooleanString.False,
          },
          order: { create_time: "DESC" },
        });
      const info = {} as any;
      info.networks = networkList.map((el: any) => {
        return {
          id: el.network_in_sensor_id || el.id,
          name: `${el.name}`,
        };
      });
      info.logicalSubnets = logicalSubnetList.map((el) => {
        return {
          id: el.id,
          name: `${el.name}`,
        };
      });

      if (isCms) {
        const [rows] = await this.npmdCmsNetworkGroupModel.findAndCount({
          where: {
            // 只查未删除的
            deleted: EBooleanString.False,
          },
          order: { create_time: "DESC" },
        });
        info.networkGroups = rows.map((r) => ({
          ...r,
          network_ids: (r as NpmdCmsNetworkGroup)?.network_in_sensor_ids,
        }));
        this.NPMD_NETWORK_INFO = info;
        return info;
      } else {
        const [rows] = await this.npmdNetworkGroupModel.findAndCount({
          where: {
            // 只查未删除的
            deleted: EBooleanString.False,
          },
          order: { create_time: "DESC" },
        });
        info.networkGroups = rows;
        this.NPMD_NETWORK_INFO = info;
        return info;
      }
    } catch (e) {
      return this.NPMD_NETWORK_INFO;
    }
  }
}
