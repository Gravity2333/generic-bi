/**  NPMD 枚举值的内容 */
export interface INpmdDict {
  id: TNpmdDictFleid;
  name: string;
  dict: INpmdDictValueEnum;
}

export interface INpmdDictValueEnum {
  [key: string]: string;
}

export const NPMD_DICT_FLEID_MAP = {
  network: '网络',
  service: '业务',
  policy: '策略',
  host_group: 'IP 地址组',
  sa_category: '应用分类',
  sa_sub_category: '应用子分类',
  sa_application: '应用',
  geo_country: '国家',
  geo_province: '省份',
  geo_city: '城市',
  geo_district: '街道',
  geo_isp: '运营商',
  geo_continent: '大洲',
  application_type: '应用类型',
  mail_login_status: '邮件登录状态',
  icmp_version: 'ICMP 版本',
  icmp_v4_message_type: 'ICMPv4 消息类型',
  icmp_v6_message_type: 'ICMPv6 消息类型',
  l7_protocol: '应用层协议',
  ip_protocol: '传输层协议',
  ethernet_type: '网络层协议',
  os_version: '终端类型',
  partition_name: '磁盘分区',
  asset_type: '资产统计类型',
  flow_log_ethernet_protocol: '流日志eth协议',
  ip_locality: 'IP所在位置',
  http_analysis_type: 'HTTP分析类型',
  protocol_dns_type: 'DNS请求类型',
  protocol_mail_instruct: '邮件指令'
};

/** NPMD枚举值 */
export const NPMD_DICT_FLEID_LIST = Object.keys(NPMD_DICT_FLEID_MAP);

/** NPMD 枚举值 */
export type TNpmdDictFleid = keyof typeof NPMD_DICT_FLEID_MAP;

/**
 * IP地址的位置
 */
export enum EIpAddressLocality {
  '内网' = 0,
  '外网' = 1,
}

/**
 * 应用统计中的应用分类
 */
export enum EApplicationType {
  '分类' = 0,
  '子分类',
  '应用',
}

/**
 * 邮件登录状态
 */
export enum EMailLoginStatus {
  '未知' = 0,
  '成功' = 1,
  '失败' = 2,
}

/**
 * 流日志eth协议
 */
export enum EFlowLogEthProtocol {
  'IPv4' = 'IPv4',
  'IPv6' = 'IPv6',
  'OTHER' = 'OTHER',
}

/**
 * ICMP版本
 */
export enum EIcmpVersion {
  'ICMPv4' = 0,
  'ICMPv6',
}

/**
 * DHCP V6版本下的消息类型
 */
export enum EDhcpV6MessageType {
  'Solicit' = 1,
  'Advertise',
  'Request',
  'Confirm',
  'Renew',
  'Rebind',
  'Reply',
  'Release',
  'Decline',
  'Reconfigure',
  'Information request',
  'Relay forw',
  'Relay reply',
  'Leasequery',
  'Leasequery reply',
  'Leasequery done',
  'Leasequery data',
  'Reconfigure request',
  'Reconfigure reply',
  'Dhcpv4 query',
  'Dhcpv4 response',
  'Activeleasequery',
  'Starttls',
  'Bndupd',
  'Bndreply',
  'Poolreq',
  'Poolresp',
  'Updreq',
  'Updreqall',
  'Upddone',
  'Connect',
  'Connectreply',
  'Disconnect',
  'State',
  'Contact',
}

/**
 * DHCP版本下的消息类型
 */
export enum EDhcpV4MessageType {
  'Discover' = 1,
  'Offer',
  'Request',
  'Decline',
  'ACK',
  'NAK',
  'Release',
  'Inform',
  'Force Renew',
  'Lease query',
  'Lease Unassigned',
  'Lease Unknown',
  'Lease Active',
  'Bulk Lease Query',
  'Lease Query Done',
  'Active LeaseQuery',
  'Lease Query Status',
  'TLS',
}

/**
 * 支持解析的传输层协议列表
 */
export const IP_PROTOCOL_LIST = [
  'icmp',
  'igmp',
  'ggp',
  'ipip',
  'stream',
  'tcp',
  'cbt',
  'egp',
  'igp',
  'bbn_rcc',
  'nvpii',
  'pup',
  'argus',
  'emcon',
  'xnet',
  'chaos',
  'udp',
  'multiplexing',
  'dcnmeas',
  'hmp',
  'prm',
  'idp',
  'rdp',
  'irt',
  'tp',
  'bulk',
  'mfe-nsp',
  'merit',
  'dccp',
  '3pc',
  'idpr',
  'xtp',
  'ddp',
  'cmtp',
  'tppp',
  'il',
  'sdrp',
  'idrp',
  'rsvp',
  'gre',
  'dsr',
  'bna',
  'esp',
  'ah',
  'i-nslp',
  'swipe',
  'narp',
  'mobile',
  'tlsp',
  'icmpv6',
  'cftp',
  'sat-expak',
  'kryptolan',
  'rvd',
  'ippc',
  'sat-mon',
  'visa',
  'ipcv',
  'cpnx',
  'cphb',
  'wsn',
  'pvp',
  'br-sat-mon',
  'sun-nd',
  'wb-mon',
  'wb-expak',
  'iso-ip',
  'vmtp',
  'svmtp',
  'vines',
  'ttp',
  'nsfnet-igp',
  'dgp',
  'tcf',
  'eigrp',
  'ospf',
  'sprite',
  'larp',
  'mtp',
  'ax.25',
  'ipinip',
  'micp',
  'scc-sp',
  'etherip',
  'encap',
  'gmtp',
  'ifmp',
  'pnni',
  'pim',
  'aris',
  'scps',
  'qnx',
  'a/n',
  'ipcomp',
  'snp',
  'compaq',
  'ipx',
  'vrrp',
  'pgm',
  'l2tp',
  'ddx',
  'iatp',
  'stp',
  'srp',
  'uti',
  'smp',
  'sm',
  'ptp',
  'isis',
  'fire',
  'crtp',
  'crudp',
  'sscopmce',
  'iplt',
  'sps',
  'pipe',
  'sctp',
  'fc',
  'rsvpe2ei',
  'mipv6',
  'udplite',
  'mpls-in-ip',
  'manet',
  'hip',
  'shim6',
  'wesp',
  'rohc',
  'ax/4000',
  'ncs_hearbeat',
];

/** 传输层协议列表转为过滤器中的枚举列表 */
export const IP_PROTOCOL_MAP = <Record<string, string>>{};

IP_PROTOCOL_LIST.forEach(
  (protocolName) =>
    (IP_PROTOCOL_MAP[protocolName] = protocolName.toUpperCase()),
);

export const PARTITION_NAME_DICT = {
  fs_system_io: '系统分区',
  fs_index_io: '索引分区',
  fs_packet_io: '全包分区',
  fs_metadata_io: '详单冷分区',
  s_metadata_hot_io: '详单热分区',
};

/** DNS请求类型 字典 */
export const PROTOCOL_DNS_TYPE_DICT = {
  '0': 'Reserved',
  '1': 'A',
  '2': 'NS',
  '3': 'MD',
  '4': 'MF',
  '5': 'CNAME',
  '6': 'SOA',
  '7': 'MB',
  '8': 'MG',
  '9': 'MR',
  '10': 'NULL',
  '11': 'WKS',
  '12': 'PTR',
  '13': 'HINFO',
  '14': 'MINFO',
  '15': 'MX',
  '16': 'TXT',
  '17': 'RP',
  '18': 'AFSDB',
  '19': 'X25',
  '20': 'ISDN',
  '21': 'RT',
  '22': 'NSAP',
  '23': 'NSAP-PTR',
  '24': 'SIG',
  '25': 'KEY',
  '26': 'PX',
  '27': 'GPOS',
  '28': 'AAAA',
  '29': 'LOC',
  '30': 'NXT',
  '31': 'EID',
  '32': 'NIMLOC',
  '33': 'SRV',
  '34': 'ATMA',
  '35': 'NAPTR',
  '36': 'KX',
  '37': 'CERT',
  '38': 'A6',
  '39': 'DNAME',
  '40': 'SINK',
  '41': 'OPT',
  '42': 'APL',
  '43': 'DS',
  '44': 'SSHFP',
  '45': 'IPSECKEY',
  '46': 'RRSIG',
  '47': 'NSEC',
  '48': 'DNSKEY',
  '49': 'DHCID',
  '50': 'NSEC3',
  '51': 'NSEC3PARAM',
  '52': 'TLSA',
  '53': 'SMIMEA',
  '55': 'HIP',
  '56': 'NINFO',
  '57': 'RKEY',
  '58': 'TALINK',
  '59': 'CDS',
  '60': 'CDNSKEY',
  '61': 'OPENPGPKEY',
  '62': 'CSYNC',
  '63': 'ZONEMD',
  '64': 'SVCB',
  '65': 'HTTPS',
  '99': 'SPF',
  '100': 'UINFO',
  '101': 'UID',
  '102': 'GID',
  '103': 'UNSPEC',
  '104': 'NID',
  '105': 'L32',
  '106': 'L64',
  '107': 'LP',
  '108': 'EUI48',
  '109': 'EUI64',
  '128': 'NXNAME',
  '249': 'TKEY',
  '250': 'TSIG',
  '251': 'IXFR',
  '252': 'AXFR',
  '253': 'MAILB',
  '254': 'MAILA',
  '255': '*',
  '256': 'URI',
  '257': 'CAA',
  '258': 'AVC',
  '259': 'DOA',
  '260': 'AMTRELAY',
  '261': 'RESINFO',
  '262': 'WALLET',
  '263': 'CLA',
  '264': 'IPN',
  '32768': 'TA',
  '32769': 'DLV',
  '65535': 'Reserved',
};

/**
 * eth类型
 */
export enum EEthernetType {
  'ARP' = 0,
  'IEEE802.1x',
  'IPv4',
  'IPv6',
  'IPX',
  'LACP',
  'MPLS',
  'STP',
  'Other',
  'ISIS',
}

/** SSL 认证方式 */
export enum ESslAuthType {
  '单向认证' = 0,
  '双向认证',
}

/** 操作系统类型 */
export const OS_VERSION_LIST = [
  'Chrome OS',
  'Windows NT 3.1',
  'Windows NT 3.5',
  'Windows NT 3.51',
  'Windows NT 4.0',
  'Windows 2000',
  'Windows XP',
  'windows 2003',
  'Windows Vista',
  'windows 7',
  'Windows 8.1',
  'Windows 8',
  'Windows 10',
  'Windows 98',
  'Windows 95',
  'AmigaOS',
  'Mac OS',
  'Linux',
  'OpenBSD',
  'BeOS',
  'Haiku',
  'Solaris',
  'NetBSD',
  'FreeBSD',
  'SymbOS',
  'IOS',
  'BlackBerry OS',
  'IOS',
  'Windows Phone',
  'Android',
];

/** 操作系统类型 */
export const OS_VERSION_MAP = <Record<string, string>>{};

OS_VERSION_LIST.forEach((version) => (OS_VERSION_MAP[version] = version));

/** 字典映射关系 */
export interface IDictMapping {
  id: string;
  table_name: string;
  table_field: string;
  dict_field: string;
  created_at: string;
  updated_at?: string;
  deleted_at?: string;
}

/** 资产统计类型 */
export enum EAssetType {
  '设备类型' = 1,
  '监听端口' = 2,
  '服务标签' = 3,
  '操作系统' = 4,
}

/** http 分析类型 */
export enum EHttpAnalysisType {
  '状态码' = 'status_code',
  '请求方法' = 'request_method',
  '数量统计' = 'http_request_data',
}

/** 邮件指令 */
export enum EProtocolMailInstruct{
  '收发' = 1,
  '邮件' = 2
}