/** 外发方式 */
export enum EReportSenderType {
  'Email' = 'email',
  'Snapshot' = 'snapshot',
}

/** 外发附件类型 */
export enum EAttachmentType {
  'PDF' = 'pdf',
  'EXCEL' = 'excel',
  'CSV' = 'csv',
}

/** 外发附件来源 */
export enum EAttachmentSource {
  'DASHBOARD' = 'dashboard',
  'WIDGET' = 'widget',
}

/** 执行方式 */
export enum ECronType {
  'Once' = 'once',
  'Repeat' = 'repeat',
}

/* 附件内容 */
export interface IAttachmentContent {
  /** 附件类型 */
  attachment_type: EAttachmentType;
  /** 附件来源 */
  attachment_source: EAttachmentSource;
  /** 仪表盘id列表 */
  dashboard_ids?: string[];
  /** 图表id列表 */
  widget_ids?: string[];
}

export interface ISendorOptions {
  attachment: IAttachmentContent;
  /** 超时时间 */
  timeout?: number;
}

/** 邮件发送配置 */
export interface IEmailSenderOptions extends ISendorOptions {
  /** 收件人邮件地址 */
  receiver_emails: string[];
  /** 邮件主题 */
  subject: string;
  /** 邮件正文 */
  content: string;
}

/** 快照配置 */
export interface ISnapShotSenderOptions extends ISendorOptions {}

/** 生成快照文件，不对外发送文件 */
export interface IReportSnapshotOptions {}

interface IReportBase {
  id?: string;
  /** 名称 */
  name: string;
  /** 所选择的仪表盘 IDs */
  dashboard_ids: string[];
  /** cron类型 */
  cron_type?: ECronType;
  /** 执行时间 */
  exec_time?: string;
  /** Cron 表达式 */
  cron: string;
  /** 时区 */
  timezone: string;
  /** 外发方式 */
  sender_type: EReportSenderType;
  /** 全局时间 */
  global_time_range?: string;
  /** 备注 */
  description?: string;
  created_at?: string;
  updated_at?: string;
  delete_at?: string | null;
}

export interface IReport extends IReportBase {
  /** 外发配置 */
  sender_options: IEmailSenderOptions | IReportSnapshotOptions;
}

/**
 * Report 的 Form 表单数据
 */
export interface IReportFormData extends IReportBase {
  /** 外发配置 JSON 字符串 */
  sender_options: string;
}

// 执行 job
// ==================
/** 报表任务触发执行的方式 */
export enum EReportJobTriggerType {
  /** cron 表达式 */
  Cron = 'cron',
  /** 人工触发 */
  Once = 'once',
}

/** 报表任务的状态 */
export enum EReportJobStatus {
  /** 执行中 */
  Running = '0',
  /** 执行完成 */
  Finished = '1',
}

/** 报表任务的执行结果 */
export enum EReportJobExecutionResult {
  /** 成功 */
  Success = '0',
  /** 失败 */
  Failure = '1',
}

export interface IReportJobLog {
  id: string;
  /** 报表 ID */
  report_id: string;
  /** 触发方式 */
  trigger_type: EReportJobTriggerType;
  /** 任务状态 */
  status: EReportJobStatus;
  /** 执行结果 */
  execution_result?: EReportJobExecutionResult;
  /** 执行生成的文件 */
  execution_file?: string;
  /** 日志 */
  execution_log?: string;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
  delete_at?: string | null;
}
