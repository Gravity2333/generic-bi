import { EDatabaseType } from "@bi/common";
import { Pool } from "pg";
export function postgrePlugin(option: Record<string, any>) {
    // 处理postgre
    const pool = new Pool({
        user: option?.user,
        password: option?.password,
        host: option?.host,
        port: option?.port,
        database: option?.database,
        max: 20, // 连接池中最大的连接数
        idleTimeoutMillis: 30000, // 一个连接被回收前可以保持空闲的时间
        connectionTimeoutMillis: 2000, // 建立连接时的超时时间
    });
    return {
        type: EDatabaseType.POSTGRE,
        querying: function <T>(sql: string) {
            return new Promise<{ data: T }>((resolve, reject) => {
                pool.connect((err, client, done) => {
                    if (err) reject(err);
                    // 执行查询
                    client?.query(sql, (err, res) => {
                        if (err) {
                            done();
                            reject(err);
                        } else {
                            done();
                            resolve(res.rows);
                        }
                    });
                });
            });
        },
    };
}