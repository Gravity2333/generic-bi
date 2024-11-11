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