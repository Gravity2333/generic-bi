import { join } from 'path';
import { readFileSync } from 'fs';
import * as ClickHouse from '@posthog/clickhouse';
import * as fs from 'fs';
import * as path from 'path';
import { generateSql } from '..';

// 连接 ClickHouse
// ===============
const host = process.env.CLICKHOUSE_HOST || '10.0.4.164';
const port = process.env.CLICKHOUSE_PORT || 443;
const database = process.env.CLICKHOUSE_DB || 'fpc';
const ch = new ClickHouse({
  protocol: 'https:',
  host: host,
  port: port,
  path: '/clickhouse/',
  user: 'clickhouse',
  password: 'Machloop@123',
  queryOptions: {
    database,
  },
  // This object merge with request params (see request lib docs)
  ca: readFileSync(join(__dirname, "../../bi-manager/src/config/ch_config/certs/server.crt")),
  requestCert: true,
  rejectUnauthorized: false,
});

// 遍历 mock 文件
// ===============
const mockDir = path.resolve(__dirname, './__mock__');
const mockFilePathList: string[] = [];
fs.readdirSync(mockDir).forEach((file) => {
  if (path.extname(file) === '.json') {
    mockFilePathList.push(`${mockDir}/${file}`);
  }
});

// 生成测试用例
// ===============
mockFilePathList.forEach((filePath) => {
  const basename = path.basename(filePath);

  describe(`${basename} test`, () => {
    const json = require(filePath);
    const { sql } = generateSql(json, false);
    
    test('should be converted from json to sql', () => {
      expect(sql).toMatch(/SELECT/i);
      expect(sql).toMatch(/FROM/i);
      expect(sql).toMatch(/WHERE/i);
    });

    test('should sql execute successfully', async () => {
      return ch.querying(sql).then((result) => {
        expect(result).toHaveProperty('data');
        expect(result).toHaveProperty('meta');
      });
    });
  });
});
