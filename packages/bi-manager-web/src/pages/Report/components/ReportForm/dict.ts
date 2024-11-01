import { DefaultLocale } from 'react-js-cron';

export const CHINESE_LOCALE: DefaultLocale = {
  everyText: '每',
  emptyMonths: '每月',
  emptyMonthDays: '每天',
  emptyMonthDaysShort: '每天',
  emptyWeekDays: '每天',
  emptyWeekDaysShort: '每天',
  emptyHours: '每小时',
  emptyMinutes: '每分钟',
  emptyMinutesForHourPeriod: '每分钟',
  yearOption: '年',
  monthOption: '月',
  weekOption: '周',
  dayOption: '日',
  hourOption: '时',
  minuteOption: '分',
  rebootOption: '重新启动',
  prefixPeriod: '每',
  prefixMonths: '的',
  prefixMonthDays: '的',
  prefixWeekDays: '的',
  prefixWeekDaysForMonthAndYearPeriod: '且',
  prefixHours: '的',
  prefixMinutes: ':',
  prefixMinutesForHourPeriod: '的',
  suffixMinutesForHourPeriod: '分',
  errorInvalidCron: '无效的计划表达式',
  clearButtonText: '清空',
  weekDays: [
    // Order is important, the index will be used as value
    '周日', // Sunday must always be first, it's "0"
    '周一',
    '周二',
    '周三',
    '周四',
    '周五',
    '周六',
  ],
  months: [
    // Order is important, the index will be used as value
    '一月',
    '二月',
    '三月',
    '四月',
    '五月',
    '六月',
    '七月',
    '八月',
    '九月',
    '十月',
    '十一月',
    '十二月',
  ],
  // Order is important, the index will be used as value
  altWeekDays: [
    '周日', // Sunday must always be first, it's "0"
    '周一',
    '周二',
    '周三',
    '周四',
    '周五',
    '周六',
  ],
  // Order is important, the index will be used as value
  altMonths: [
    '一月',
    '二月',
    '三月',
    '四月',
    '五月',
    '六月',
    '七月',
    '八月',
    '九月',
    '十月',
    '十一月',
    '十二月',
  ],
};


export const MAIL_SUFFIX_LIST = [
  '@QQ.com',
  '@machloop.com',
  '@163.com',
  '@126.com',
  '@gmail.com',
  '@outlook.com',
];