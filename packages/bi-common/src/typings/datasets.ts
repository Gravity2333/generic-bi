export enum DataSetTypes {
  'POSTGRE' = 'postgre',
  'CLICKHOUSE' = 'clickhouse',
}


export interface ExternalSystem{
    querying: <T>(sql: string) => Promise<{
        data: T
    }>,
    unLink: ()=> void
}