/** 网络 */
export interface INetwork {
  id: string;
  name: string;
  /**
   * 所属探针id
   */
  sensorId?: string;
  /**
   * 所属探针名称
   */
  sensorName?: string;
  /** 所属探针类型 */
  sensorType?: string;
  serialNumber?: string;
}

/**
 * 逻辑子网
 */
export interface ILogicalSubnet {
  id: string;
  name: string;
  networkIds?: string;
  serialNumber?: number;
}

// 网络组类型
export interface INetworkGroup {
  id: string;
  name: string;
  network_ids: string;
}

export interface INetworkInfoType {
  networks: INetwork[];
  logicalSubnets: ILogicalSubnet[];
  networkGroups: INetworkGroup[];
}
