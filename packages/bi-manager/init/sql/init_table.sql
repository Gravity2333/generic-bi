-- CREATE DATABASE bi OWNER machloop;
-- GRANT ALL PRIVILEGES ON DATABASE bi TO machloop;
-- REVOKE CONNECT ON DATABASE bi FROM public;
-- ----------------------------
-- Table structure for bi_database
-- ----------------------------
CREATE TABLE IF NOT EXISTS "public"."bi_database" (
  "id" varchar(64) COLLATE "pg_catalog"."default" NOT NULL,
  "type" varchar(32) COLLATE "pg_catalog"."default" NOT NULL DEFAULT '',
  "option" text COLLATE "pg_catalog"."default" NOT NULL DEFAULT '',
  "created_at" timestamptz(6),
  "updated_at" timestamptz(6),
  "deleted_at" timestamptz(6),
  "owner" varchar(64) COLLATE "pg_catalog"."default" NOT NULL DEFAULT '',
  CONSTRAINT "bi_database_pkey" PRIMARY KEY ("id")
);
COMMENT ON COLUMN "public"."bi_database"."id" IS '主键';
COMMENT ON COLUMN "public"."bi_database"."type" IS '数据库类型';
COMMENT ON COLUMN "public"."bi_database"."option" IS '数据库连接配置';
COMMENT ON COLUMN "public"."bi_database"."created_at" IS '创建时间';
COMMENT ON COLUMN "public"."bi_database"."updated_at" IS '更新时间';
COMMENT ON COLUMN "public"."bi_database"."deleted_at" IS '删除时间';
COMMENT ON COLUMN "public"."bi_database"."owner" IS 'owner的id,可对Dashbase进行增删改';


-- ----------------------------
-- Table structure for bi_dashboard
-- ----------------------------
CREATE TABLE IF NOT EXISTS "public"."bi_dashboard" (
  "id" varchar(64) COLLATE "pg_catalog"."default" NOT NULL,
  "name" varchar(32) COLLATE "pg_catalog"."default" NOT NULL DEFAULT '',
  "widget_ids" varchar(64)[] COLLATE "pg_catalog"."default" NOT NULL,
  "specification" text COLLATE "pg_catalog"."default" NOT NULL DEFAULT '',
  "readonly" varchar(6) COLLATE "pg_catalog"."default" NOT NULL DEFAULT '0',
  "description" varchar(512) COLLATE "pg_catalog"."default" NOT NULL DEFAULT '',
  "created_at" timestamptz(6),
  "updated_at" timestamptz(6),
  "deleted_at" timestamptz(6),
  "owner" varchar(64) COLLATE "pg_catalog"."default" NOT NULL DEFAULT '',
  CONSTRAINT "bi_dashboard_pkey" PRIMARY KEY ("id")
);
COMMENT ON COLUMN "public"."bi_dashboard"."id" IS '主键';
COMMENT ON COLUMN "public"."bi_dashboard"."name" IS 'Dashboard名称';
COMMENT ON COLUMN "public"."bi_dashboard"."widget_ids" IS 'widget的IDs';
COMMENT ON COLUMN "public"."bi_dashboard"."specification" IS '配置JSON';
COMMENT ON COLUMN "public"."bi_dashboard"."readonly" IS '只读';
COMMENT ON COLUMN "public"."bi_dashboard"."description" IS '备注';
COMMENT ON COLUMN "public"."bi_dashboard"."created_at" IS '创建时间';
COMMENT ON COLUMN "public"."bi_dashboard"."updated_at" IS '更新时间';
COMMENT ON COLUMN "public"."bi_dashboard"."deleted_at" IS '删除时间';
COMMENT ON COLUMN "public"."bi_dashboard"."owner" IS 'owner的id,可对Dashboard进行增删改';

-- ----------------------------
-- Table structure for bi_widget
-- ----------------------------=
CREATE TABLE IF NOT EXISTS "public"."bi_widget" (
  "id" varchar(64) COLLATE "pg_catalog"."default" NOT NULL,
  "name" varchar(32) COLLATE "pg_catalog"."default" NOT NULL DEFAULT '',
  "datasource" varchar(64) COLLATE "pg_catalog"."default" NOT NULL DEFAULT '',
  "viz_type" varchar(32) COLLATE "pg_catalog"."default" NOT NULL DEFAULT '',
  "specification" text COLLATE "pg_catalog"."default" NOT NULL DEFAULT '',
  "readonly" varchar(6) COLLATE "pg_catalog"."default" NOT NULL DEFAULT '0',
  "template" varchar(6) COLLATE "pg_catalog"."default" NOT NULL DEFAULT '0',
  "description" varchar(512) COLLATE "pg_catalog"."default" NOT NULL DEFAULT '',
  "created_at" timestamptz(6),
  "updated_at" timestamptz(6),
  "deleted_at" timestamptz(6),
  "owner" varchar(64) COLLATE "pg_catalog"."default" NOT NULL DEFAULT '',
  CONSTRAINT "bi_widget_pkey" PRIMARY KEY ("id")
);
COMMENT ON COLUMN "public"."bi_widget"."id" IS '主键';
COMMENT ON COLUMN "public"."bi_widget"."name" IS 'widget名称';
COMMENT ON COLUMN "public"."bi_widget"."datasource" IS '数据源';
COMMENT ON COLUMN "public"."bi_widget"."viz_type" IS '图表展示类型';
COMMENT ON COLUMN "public"."bi_widget"."specification" IS '配置JSON';
COMMENT ON COLUMN "public"."bi_widget"."readonly" IS '只读';
COMMENT ON COLUMN "public"."bi_widget"."template" IS '模板';
COMMENT ON COLUMN "public"."bi_widget"."description" IS '备注';
COMMENT ON COLUMN "public"."bi_widget"."created_at" IS '创建时间';
COMMENT ON COLUMN "public"."bi_widget"."updated_at" IS '更新时间';
COMMENT ON COLUMN "public"."bi_widget"."deleted_at" IS '删除时间';
COMMENT ON COLUMN "public"."bi_widget"."owner" IS 'owner的id,可对widget进行增删改';

-- ----------------------------
-- Table structure for bi_report
-- ----------------------------
CREATE TABLE IF NOT EXISTS "public"."bi_report" (
  "id" varchar(64) COLLATE "pg_catalog"."default" NOT NULL,
  "name" varchar(32) COLLATE "pg_catalog"."default" NOT NULL DEFAULT '',
  "dashboard_ids" varchar(64)[] COLLATE "pg_catalog"."default" NOT NULL,
  "cron" text COLLATE "pg_catalog"."default" NOT NULL DEFAULT '',
  "exec_time" text COLLATE "pg_catalog"."default" DEFAULT '',
  "timezone" varchar(32) COLLATE "pg_catalog"."default" NOT NULL DEFAULT '',
  "cron_type" varchar(32) COLLATE "pg_catalog"."default" NOT NULL DEFAULT '',
  "sender_type" varchar(32) COLLATE "pg_catalog"."default" NOT NULL DEFAULT '',
  "sender_options" text COLLATE "pg_catalog"."default" NOT NULL DEFAULT '',
  "description" varchar(512) COLLATE "pg_catalog"."default" NOT NULL DEFAULT '',
  "global_time_range" text COLLATE "pg_catalog"."default" NOT NULL DEFAULT '',
  "created_at" timestamptz(6),
  "updated_at" timestamptz(6),
  "deleted_at" timestamptz(6),
  "owner" varchar(64) COLLATE "pg_catalog"."default" NOT NULL DEFAULT '',
  CONSTRAINT "bi_report_pkey" PRIMARY KEY ("id")
);
COMMENT ON COLUMN "public"."bi_report"."id" IS '主键';
COMMENT ON COLUMN "public"."bi_report"."name" IS '名称';
COMMENT ON COLUMN "public"."bi_report"."dashboard_ids" IS 'Dashboard Ids';
COMMENT ON COLUMN "public"."bi_report"."cron" IS 'Cron 表达式';
COMMENT ON COLUMN "public"."bi_report"."exec_time" IS '执行时间';
COMMENT ON COLUMN "public"."bi_report"."timezone" IS '时区';
COMMENT ON COLUMN "public"."bi_report"."cron_type" IS '执行类型';
COMMENT ON COLUMN "public"."bi_report"."sender_type" IS '外发方式（email: 邮件外发）';
COMMENT ON COLUMN "public"."bi_report"."sender_options" IS '外发配置（不同的方式有不同的配置项）';
COMMENT ON COLUMN "public"."bi_report"."description" IS '备注';
COMMENT ON COLUMN "public"."bi_report"."global_time_range" IS '全局时间范围';
COMMENT ON COLUMN "public"."bi_report"."created_at" IS '创建时间';
COMMENT ON COLUMN "public"."bi_report"."updated_at" IS '更新时间';
COMMENT ON COLUMN "public"."bi_report"."deleted_at" IS '删除时间';
COMMENT ON COLUMN "public"."bi_report"."owner" IS 'owner的id,可对report进行增删改';

-- ----------------------------
-- Table structure for bi_report_job_log
-- ----------------------------
CREATE TABLE IF NOT EXISTS "public"."bi_report_job_log" (
  "id" varchar(64) COLLATE "pg_catalog"."default" NOT NULL,
  "report_id" varchar(64) COLLATE "pg_catalog"."default" NOT NULL DEFAULT '',
  "trigger_type" varchar(32) COLLATE "pg_catalog"."default" NOT NULL DEFAULT '',
  "status" varchar(32) COLLATE "pg_catalog"."default" NOT NULL DEFAULT '',
  "execution_result" varchar(32) COLLATE "pg_catalog"."default" NOT NULL DEFAULT '',
  "execution_file" varchar(512) COLLATE "pg_catalog"."default" NOT NULL DEFAULT '',
  "execution_log" varchar(512) COLLATE "pg_catalog"."default" NOT NULL DEFAULT '',
  "created_by" varchar(64) COLLATE "pg_catalog"."default" NOT NULL DEFAULT '',
  "created_at" timestamptz(6),
  "updated_at" timestamptz(6),
  "deleted_at" timestamptz(6),
  CONSTRAINT "bi_report_job_log_pkey" PRIMARY KEY ("id")
);
COMMENT ON COLUMN "public"."bi_report_job_log"."id" IS '主键';
COMMENT ON COLUMN "public"."bi_report_job_log"."report_id" IS '报表ID';
COMMENT ON COLUMN "public"."bi_report_job_log"."trigger_type" IS '触发类型（CRON: cron表达式，ONCE: 人工触发）';
COMMENT ON COLUMN "public"."bi_report_job_log"."status" IS '任务状态（0: 执行中，1: 执行完成）';
COMMENT ON COLUMN "public"."bi_report_job_log"."execution_result" IS '执行结果状态（0: 成功，1: 失败）';
COMMENT ON COLUMN "public"."bi_report_job_log"."execution_file" IS '执行生成的文件';
COMMENT ON COLUMN "public"."bi_report_job_log"."execution_log" IS '执行日志';
COMMENT ON COLUMN "public"."bi_report_job_log"."created_by" IS '人工触发时的触发人';
COMMENT ON COLUMN "public"."bi_report_job_log"."created_at" IS '创建时间';
COMMENT ON COLUMN "public"."bi_report_job_log"."updated_at" IS '更新时间';
COMMENT ON COLUMN "public"."bi_report_job_log"."deleted_at" IS '删除时间';

-- ----------------------------
-- Table structure for bi_npmd_dict_mapping
-- ----------------------------
CREATE TABLE IF NOT EXISTS "public"."bi_npmd_dict_mapping" (
  "id" varchar(64) COLLATE "pg_catalog"."default" NOT NULL,
  "table_name" varchar(64) COLLATE "pg_catalog"."default" NOT NULL DEFAULT '',
  "table_field" varchar(32) COLLATE "pg_catalog"."default" NOT NULL DEFAULT '',
  "dict_field" varchar(32) COLLATE "pg_catalog"."default" NOT NULL DEFAULT '',
  "created_at" timestamptz(6),
  "updated_at" timestamptz(6),
  "deleted_at" timestamptz(6),
  CONSTRAINT "bi_npmd_dict_mapping_pkey" PRIMARY KEY ("id")
);
COMMENT ON COLUMN "public"."bi_npmd_dict_mapping"."id" IS '主键';
COMMENT ON COLUMN "public"."bi_npmd_dict_mapping"."table_name" IS '表名';
COMMENT ON COLUMN "public"."bi_npmd_dict_mapping"."table_field" IS '表字段';
COMMENT ON COLUMN "public"."bi_npmd_dict_mapping"."dict_field" IS '映射到字典中的字段';
COMMENT ON COLUMN "public"."bi_npmd_dict_mapping"."created_at" IS '创建时间';
COMMENT ON COLUMN "public"."bi_npmd_dict_mapping"."updated_at" IS '更新时间';
COMMENT ON COLUMN "public"."bi_npmd_dict_mapping"."deleted_at" IS '删除时间';

-- ----------------------------
-- Table structure for bi_smtp
-- ----------------------------
CREATE TABLE IF NOT EXISTS "public"."bi_smtp" (
  "id" varchar(64) COLLATE "pg_catalog"."default" NOT NULL,
  "encrypt" varchar(6) COLLATE "pg_catalog"."default" NOT NULL DEFAULT '0',
  "login_password" varchar(32) COLLATE "pg_catalog"."default" NOT NULL DEFAULT '',
  "login_user" varchar(32) COLLATE "pg_catalog"."default" NOT NULL DEFAULT '',
  "mail_address" varchar(64) COLLATE "pg_catalog"."default" NOT NULL DEFAULT '',
  "mail_username" varchar(32) COLLATE "pg_catalog"."default" NOT NULL DEFAULT '',
  "server_port" varchar(32) COLLATE "pg_catalog"."default" NOT NULL DEFAULT '',
  "smtp_server" varchar(64) COLLATE "pg_catalog"."default" NOT NULL DEFAULT '',
  "created_at" timestamptz(6),
  "updated_at" timestamptz(6),
  "deleted_at" timestamptz(6),
  "owner" varchar(64) COLLATE "pg_catalog"."default" NOT NULL DEFAULT '',
  CONSTRAINT "bi_smtp_pkey" PRIMARY KEY ("id")
);
COMMENT ON COLUMN "public"."bi_smtp"."id" IS '主键';
COMMENT ON COLUMN "public"."bi_smtp"."encrypt" IS '是否加密';
COMMENT ON COLUMN "public"."bi_smtp"."login_password" IS '登录密码';
COMMENT ON COLUMN "public"."bi_smtp"."login_user" IS '登录用户名';
COMMENT ON COLUMN "public"."bi_smtp"."mail_address" IS '邮件地址';
COMMENT ON COLUMN "public"."bi_smtp"."mail_username" IS '邮件名称';
COMMENT ON COLUMN "public"."bi_smtp"."server_port" IS '服务端口';
COMMENT ON COLUMN "public"."bi_smtp"."smtp_server" IS '邮件服务器';
COMMENT ON COLUMN "public"."bi_smtp"."created_at" IS '创建时间';
COMMENT ON COLUMN "public"."bi_smtp"."updated_at" IS '更新时间';
COMMENT ON COLUMN "public"."bi_smtp"."deleted_at" IS '删除时间';
COMMENT ON COLUMN "public"."bi_smtp"."owner" IS 'owner的id,可对SMTP进行增删改';
