import { EDatabaseType } from "@bi/common";
import * as ClickHouse from "@posthog/clickhouse";

export function clickhousePlugin(option: Record<string, any>) {
  const instance = new ClickHouse({
    protocol: option?.protocol,
    host: option?.host,
    port: option?.port,
    path: option?.path,
    format: "JSON",
    user: option?.user,
    password: option?.password,
    queryOptions: {
      database: option?.database,
    },
    ...(option?.ca
      ? {
          ca: option.ca,
          requestCert: true,
          rejectUnauthorized: false,
        }
      : {}),
  });
  (instance as any).type = EDatabaseType.CLICKHOUSE;
  return instance;
}
