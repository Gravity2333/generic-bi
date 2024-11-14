import { EDatabaseType } from "./database"

export const _GET_UTC_DIFF_DATETIME_SQL = (timeColun: string, type: EDatabaseType) => {
    const UTC_DIFF_DATETIME_SQL_MAP = {
        [EDatabaseType.CLICKHOUSE]: `toDateTime64('${timeColun}', 3, 'UTC')`,
        [EDatabaseType.POSTGRE]: `'${timeColun}'`,
        [EDatabaseType.MYSQL]: `'${timeColun}'`
    }

    return UTC_DIFF_DATETIME_SQL_MAP[type] || `'${timeColun}'`
}

export const _GLOBAL_IN_DIFF_SQL_ = {
    [EDatabaseType.CLICKHOUSE]: `global IN`,
    [EDatabaseType.POSTGRE]: `IN`,
    [EDatabaseType.MYSQL]: `IN`
}

export const DATA_SET_QUERY_MAP = {
    [EDatabaseType.POSTGRE]: `SELECT tablename as name FROM pg_catalog.pg_tables WHERE schemaname != 'pg_catalog' AND schemaname != 'information_schema'`,
    [EDatabaseType.CLICKHOUSE]:
      "SELECT name, comment FROM system.tables WHERE name LIKE '%d_fpc_%'",
    [EDatabaseType.MYSQL]: "SHOW TABLES",
  };
  
  export const _GET_DATA_SET_COLUMN_QUERY_MAP = (
    database: string,
    tableName: string
  ) => ({
    [EDatabaseType.POSTGRE]: `SELECT 
      c.column_name as name,
      c.data_type as type,
      pg_catalog.col_description(t.oid, c.ordinal_position) AS comment
  FROM 
      information_schema.columns c
  JOIN 
      pg_catalog.pg_class t ON t.relname = c.table_name
  LEFT JOIN 
      pg_catalog.pg_description d ON d.objoid = t.oid AND d.objsubid = c.ordinal_position
  WHERE 
      c.table_schema = 'public'  -- specify your schema here
      AND c.table_name = '${tableName}'  -- replace with your table name
  ORDER BY 
      c.ordinal_position;`,
    [EDatabaseType.CLICKHOUSE]: `desc ${tableName}`,
    [EDatabaseType.MYSQL]: `
      SELECT 
      COLUMN_NAME as 'Field', 
      COLUMN_COMMENT as 'Comment'
      FROM 
      information_schema.columns 
      WHERE 
      table_schema = '${database}' 
      AND table_name = '${tableName}';
     `,
  });
  