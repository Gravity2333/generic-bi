export interface ExternalSystem{
  type: EDatabaseType,
  querying: <T>(sql: string) => Promise<T>,
}


export enum EDatabaseType {
  'CLICKHOUSE' = 'CLICKHOUSE',
  'POSTGRE' = 'POSTGRE',
  'MYSQL' = 'MYSQL',
}

export interface DataBaseType {
  id?: string;
  name: string;
  type: EDatabaseType;
  readonly: string;
  option: string;
}

export interface DataBaseParsedType {
  id?: string;
  name: string;
  type: EDatabaseType;
  readonly: string;
  option: Record<string, any>;
}
