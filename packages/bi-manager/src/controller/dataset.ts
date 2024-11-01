import { EBIVERSION, IClickhouseColumn, IClickhouseTable } from "@bi/common";
import { Controller, Get, Inject, Param, Provide } from "@midwayjs/decorator";
import { Context } from "egg";
import { NpmdDictMappingService } from "../service/npmdDictMapping";
import { ClickHouseService } from "../service/clickhouse";
const isCms = process.env.BI_VERSION === EBIVERSION.CMS;

/** 元元数据详单表 */
const PROTOCOL_RECORD_REG = /d_fpc_protocol_([a-zA-Z0-9]+)_log_record/g;

@Provide()
@Controller("/web-api/v1")
export class DatasetAPIController {
  @Inject()
  ctx: Context;

  @Inject()
  npmdDictMappingService: NpmdDictMappingService;

  @Inject()
  clickHouseService: ClickHouseService;

  @Get("/datasets")
  async listAllDatasets() {
    let data: any[] = [];
    /** 由于探针的详单和统计数据存在两个数据库中，所以要查询两个并且拼接 */
    /** 探针和cms都默认采用d_fpc开头的表,不再采用t_fpc开头的表,需要在此过滤掉 */
    const { data: recordData = [] } =
      await this.ctx.app.clickhouseClient.querying<
        any,
        // @ts-ignore
        IClickhouseTable
      >("SELECT name, comment FROM system.tables WHERE name LIKE '%d_fpc_%'");

    if (!isCms) {
      const { data: chData = [] } = await this.ctx.app.chStatusClient.querying<
        any,
        // @ts-ignore
        IClickhouseColumn
      >("SELECT name, comment FROM system.tables WHERE name LIKE '%d_fpc_%'");
      data = [...recordData, ...chData];
    } else {
      data = [...recordData];
    }

    // 数组转对象，方便后续判断
    const tableNameMap = data.reduce((prev, curr) => {
      return {
        ...prev,
        [curr.name]: curr,
      };
    }, {});

    // 填充 comment 字段
    const tables = data
      // 保留统计表/会话详单表/元数据表
      .filter((el) => {
        // 分析表表d
        if (el.name.indexOf("d_fpc_analysis_suricata_alert_message_replace") > -1) {
          return true;
        }

        if (el.name.indexOf("fpc_http_analysis_result") > -1) {
          return true;
        }

        if(el.name.indexOf("d_fpc_metric_http_request_data_record") > -1){
          return false
        }

        if (el.name.indexOf("_metric_") > -1) {
          /** 过滤掉restapi */
          // if (el.name.indexOf("_metric_restapi_") > -1) {
          //   return false;
          // }
          return true;
        }
        // 统计表
        if (el.name.indexOf("_metric_") > -1) {
          /** 过滤掉restapi */
          // if (el.name.indexOf("_metric_restapi_") > -1) {
          //   return false;
          // }
          return true;
        }
        // 会话详单
        if (el.name.indexOf("flow_log_record") > -1) {
          return true;
        }
        // 详单数量统计表
        if (el.name.indexOf("_metadata_statistics") > -1) {
          return true;
        }
        // 元数据
        PROTOCOL_RECORD_REG.lastIndex = 0;
        if (PROTOCOL_RECORD_REG.test(el.name)) {
          return true;
        }
        // 资产
        if (el.name.indexOf("_asset_") > -1) {
          return true;
        }

        // 文件详单
        if (el.name.indexOf("fpc_file_restore_info") > -1) {
          return true;
        }

        // 其他的全部过滤掉
        return false;
      })
      // 排除离线文件，排除统计聚合表，带有小尾巴后缀的全部排除掉
      // 例如聚合表 _1h _5m
      // 例如离线文件  _rocord_{uuid}
      // 硬编码 d_fpc_asset_information,d_fpc_asset_first 不排除
      // 详单数量统计表 不排除 d_fpc_metadata_statistics
      .filter((el) =>
        /(record|statistics|d_fpc_asset_first|d_fpc_asset_information|d_fpc_asset_newest|fpc_file_restore_info|d_fpc_metadata_statistics|d_fpc_analysis_suricata_alert_message_replace|fpc_http_analysis_result)$/g.test(
          el.name
        )
      )
      .map((row) => {
        // 如果是会话详单
        if (row.name.includes("flow_log_record")) {
          return {
            ...row,
            exist_rollup: false,
          };
        }

        // 如果是统计表
        if (row.name.includes("_metric_")) {
          return {
            ...row,
            // 判断是否存在多时间粒度
            exist_rollup:
              !!tableNameMap[`${row.name}_5m`] ||
              !!tableNameMap[`${row.name}_1h`],
          };
        }
        // 如果是元数据表
        PROTOCOL_RECORD_REG.lastIndex = 0;
        const group = PROTOCOL_RECORD_REG.exec(row.name);
        if (group) {
          // 正则匹配协议名称
          if (group.length === 3) {
            return {
              ...row,
              exist_rollup: false,
            };
          }
        }
        return {
          ...row,
          exist_rollup: false,
        };
      });
    return tables;
  }

  @Get("/datasets/:tableName/columns")
  async listDatasetColumns(@Param() tableName: string) {
    // 判断查询两个表
    let data = [];
    if (isCms) {
      data =
        (
          await this.ctx.app.clickhouseClient.querying<
            any,
            // @ts-ignore
            IClickhouseColumn
          >(`desc ${tableName}`)
        )?.data || [];
    } else {
      if (tableName.indexOf("_metric_") > -1||tableName.indexOf("fpc_http_analysis_result")>-1) {
        // 统计信息
        data =
          (
            await this.ctx.app.chStatusClient.querying<
              any,
              // @ts-ignore
              IClickhouseColumn
            >(`desc ${tableName}`)
          )?.data || [];
      } else {
        // 详单信息
        data =
          (
            await this.ctx.app.clickhouseClient.querying<
              any,
              // @ts-ignore
              IClickhouseColumn
            >(`desc ${tableName}`)
          )?.data || [];
      }
    }

    // 获取字段管理关系
    const { dictMappingMap } =
      await this.npmdDictMappingService.listDictMappingByTableName(tableName);

    for (let index = 0; index < data.length; index++) {
      const column = data[index];

      const key = `${tableName}__${column.name}`;
      if (dictMappingMap[key]) {
        column.dict_field = dictMappingMap[key];
      }
    }

    return data;
  }
}
