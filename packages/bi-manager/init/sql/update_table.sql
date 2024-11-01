ALTER TABLE "public"."bi_report" ADD COLUMN IF NOT EXISTS "exec_time" text COLLATE "pg_catalog"."default" DEFAULT '';
ALTER TABLE "public"."bi_report" ADD COLUMN IF NOT EXISTS "cron_type" varchar(32) COLLATE "pg_catalog"."default" NOT NULL DEFAULT '';
ALTER TABLE "public"."bi_report" ADD COLUMN IF NOT EXISTS "global_time_range" text COLLATE "pg_catalog"."default" NOT NULL DEFAULT '';

ALTER TABLE "public"."bi_dashboard" ADD COLUMN IF NOT EXISTS "readonly" varchar(6) COLLATE "pg_catalog"."default" NOT NULL DEFAULT '0';
ALTER TABLE "public"."bi_widget" ADD COLUMN IF NOT EXISTS "readonly" varchar(6) COLLATE "pg_catalog"."default" NOT NULL DEFAULT '0';
ALTER TABLE "public"."bi_widget" ADD COLUMN IF NOT EXISTS "template" varchar(6) COLLATE "pg_catalog"."default" NOT NULL DEFAULT '0';