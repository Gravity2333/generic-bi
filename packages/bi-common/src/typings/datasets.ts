export enum DataSetTypes {
  'POSTGRE' = 'postgre',
  'CLICKHOUSE' = 'clickhouse',
}


export interface ExternalSystem{
    querying: <T>(sql: string) => Promise<T>,
    unLink: ()=> void
}