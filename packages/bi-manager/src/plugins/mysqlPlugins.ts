import { EDatabaseType } from "@bi/common";
const mysql = require('mysql')
export function mysqlPlugin(option: Record<string, any>) {
    return {
        type: EDatabaseType.MYSQL,
        querying: function <T>(sql: string) {
            // 设置数据库连接参数
            const connection = mysql.createConnection({
                host: option?.host,
                user: option?.user,
                password: option?.password,
                database: option?.database,
                port: option?.port,
            });

            return new Promise<{ data: T }>((resolve, reject) => {
                connection.connect(function (error) {
                    if (error) reject(error);
                    connection.query(sql, function (error, results, fields) {
                        if (error) {
                            connection.end()
                            reject(error);
                        } else {
                            connection.end()
                            resolve(results.rows);
                        }
                    });
                });

            });
        },
    };
}