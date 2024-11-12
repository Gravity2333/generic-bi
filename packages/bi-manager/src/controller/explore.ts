import {
  ESelectType,
  generateReferenceSpecification,
  generateSql,
  getTimeDiff,
  IWidgetSpecification,
} from "@bi/common";
import {
  ALL,
  Body,
  Controller,
  Inject,
  Post,
  Provide,
} from "@midwayjs/decorator";
import { Context } from "egg";
import { base64Encode } from "../utils";
import { NpmdDictService } from "../service/dicts";
import { DatabaseService } from "../service/database";

@Provide()
@Controller("/web-api/v1")
export class exploreAPIController {
  @Inject()
  ctx: Context;

  @Inject()
  databaseService: DatabaseService;

  @Inject()
  npmdDictService: NpmdDictService;

  @Post("/explore-json")
  async listWidgets(
    @Body(ALL)
    {
      formData,
      queryId,
      headers,
    }: {
      formData: IWidgetSpecification;
      queryId: string;
      headers: any;
    }
  ) {
    try {
      const {
        reference = [],
        datasource,
        time_field,
        time_grain,
        time_range,
        exist_rollup,
        database
      } = formData;

      // 标识查询 ID，用于取消查询
      const securityQueryId = queryId ? `/*${base64Encode(queryId)}*/ ` : "";
      const DBType = this.ctx.app.externalSystemClient[database]?.type
      // 组装成 sql 语句
      const { sql, colNames, colIdList } = generateSql(
        formData,
        DBType
      );
      // console.log(sql);


      const references = [];
      if (reference?.length > 0) {
        for (let r of reference) {
          if (r.expression_type === ESelectType.PERCENTAGE) {
            references.push(r);
            continue;
          }
          const { denominator } = r;
          const refSpecification = generateReferenceSpecification({
            datasource,
            reference: r,
            time_field,
            time_grain,
            time_range,
            exist_rollup,
          });
          // 生成sql
          const { sql: refSql } = generateSql(
            refSpecification as any,
            DBType
          );

          const sqlData = await this.databaseService.executeSql(
            refSql + securityQueryId
            , database);

          if (denominator) {
            const timeDiff = getTimeDiff(time_range);
            references.push({
              id: r?.id,
              name: r?.display_name,
              color: r?.color,
              value:
                parseFloat(sqlData[0][Object.keys(sqlData[0])[0]]) / timeDiff,
            });
          } else {
            references.push({
              id: r?.id,
              name: r?.display_name,
              color: r?.color,
              value: parseFloat(sqlData[0][Object.keys(sqlData[0])[0]]),
            });
          }
        }
      }

      // 可能携带查询 ID 的完整 sql 语句
      const fullSql = sql + securityQueryId;
    // console.log(fullSql)
      const sqlData = await this.databaseService.executeSql(
        fullSql
        , database);

      return {
        sql,
        colNames,
        colIdList,
        formData,
        data: sqlData,
        references,
      };
    } catch (error) {
      this.ctx?.throw(500, error);
    }
  }

  @Post("/slow-queries/cancel")
  async cancelSlowQuery(@Body(ALL) { queryIds }: { queryIds: string }) {
    try {
      const idList = queryIds ? queryIds.split(",") : [];
      await this.databaseService.cancelQueries(idList);
    } catch (e) { }
  }

  @Post("/slow-queries/cancelAll")
  async cancelAllQuery() {
    try {
      const killSql = `KILL QUERY WHERE query_id IN (SELECT query_id FROM system.processes where query LIKE '%*/%')`;
      this.databaseService.executeSql(killSql, '');
      this.databaseService.executeSql(killSql, '');
    } catch (e) { }
  }
}
