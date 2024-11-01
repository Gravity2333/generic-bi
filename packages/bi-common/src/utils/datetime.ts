import moment from 'moment';
import { ITimeRange, TTimeUnit } from '../typings';

export function getTimeZone() {
  const d = new Date();
  const timeZoneOffset = d.getTimezoneOffset();

  const op = timeZoneOffset > 0 ? '-' : '+';
  const timeZone = Math.abs(timeZoneOffset) / 60;

  return `${op}${fixedZero(timeZone)}:00`;
}

export function fixedZero(val: number): string {
  return val < 10 ? `0${val}` : String(val);
}

/**
 * 获取 UTC 0时区的时间
 * @param time 时间
 * @returns YYYY-MM-DD HH:mm:ss
 *
 * ```
 * getUtcTime(new Date())
 * getUtcTime(new Date().valueOf())
 * getUtcTime("2021-12-09T18:00:00+08:00")
 * ```
 */
export function getUtcTime(time?: Date | number | string): string {
  const d = new Date(time || new Date());
  const YYYY = d.getUTCFullYear();
  const M = d.getUTCMonth() + 1;
  const D = d.getUTCDate();
  const H = d.getUTCHours();
  const m = d.getUTCMinutes();
  const s = d.getUTCSeconds();
  return (
    YYYY +
    '-' +
    fixedZero(M) +
    '-' +
    fixedZero(D) +
    ' ' +
    fixedZero(H) +
    ':' +
    fixedZero(m) +
    ':' +
    fixedZero(s)
  );
}

/**
 *  计算最近的时间
 * @param amount 数量 (正数表示未来时间，负数表示过去时间)
 * @param unit 单位
 * @param currentTime 当前时间
 * @returns 时间戳
 *
 * ```
 * getRelativeTime(-1, 'd') // 1天前时间
 * getRelativeTime(1, 'd') // 明天的现在时间
 * getRelativeTime(-1, 'd', new Date('2021-12-09T18:00:00+08:00')) // 以传入的时间为准，往前推1天
 * ```
 */
export function getRelativeTime(
  amount: number,
  unit: TTimeUnit,
  currentTime?: number | Date,
): number {
  let time: any = currentTime ? new Date(currentTime) : new Date();
  if (unit === 'y') {
    time = time.setFullYear(time.getFullYear() + amount);
  }
  if (unit === 'M') {
    time = time.setMonth(time.getMonth() + amount);
  }
  if (unit === 'w') {
    time = time.setDate(time.getDate() + amount * 7);
  }
  if (unit === 'd') {
    time = time.setDate(time.getDate() + amount);
  }
  if (unit === 'h' || unit === 'H') {
    time = time.setHours(time.getHours() + amount);
  }
  if (unit === 'm') {
    time = time.setMinutes(time.getMinutes() + amount);
  }
  if (unit === 's') {
    time = time.setSeconds(time.getSeconds() + amount);
  }

  return new Date(time).valueOf();
}

/** 计算时间粒度
 *   当选择时间 <= 1小时，时间粒度为60s 1分钟
 *   当 1小时 < 选择时间 <= 24小时 时间粒度为300s 5分钟
 *    当 24小时 < 选择时间 时间粒度为3600s 1小时
 */
export const getMatchedInterval = (startTime: string, endTime: string) => {
  const timeDiff = moment(Number.isFinite(+endTime) ? +endTime : endTime)
    .diff(moment(Number.isFinite(+startTime) ? +startTime : startTime))
    .valueOf();
  if (timeDiff <= 0) {
    return;
  } else if (timeDiff > 0 && timeDiff <= 3600000) {
    return '1m';
  } else if (timeDiff > 3600000 && timeDiff <= 86400000) {
    return '5m';
  } else {
    return '1h';
  }
};

export const utcToTimeStamp = (time: string) => {
  return moment(time).valueOf();
};

export const timeStampToUtc = (time: number) => {
  return moment(time).format();
};

/** 获取时间范围 */
export function getTimeRange(timeRange: ITimeRange) {
  if (timeRange?.type === 'custom') {
    const custom = (() => {
      if (
        typeof timeRange?.custom[0] === 'string' &&
        typeof timeRange?.custom[1] === 'string'
      ) {
        if (!isNaN(+timeRange?.custom[0]) && !isNaN(+timeRange?.custom[1])) {
          return [
            moment(+timeRange?.custom[0]).format(),
            moment(+timeRange?.custom[1]).format(),
          ];
        }
      }
      return [
        moment(timeRange?.custom[0]).format(),
        moment(timeRange?.custom[1]).format(),
      ];
    })();
    return custom;
  } else {
    const startTime = moment();
    return [
      startTime
        .subtract(
          Math.abs((timeRange?.range! as number) || 0),
          timeRange?.unit as any,
        )
        .set('s', 0)
        .format(),
      moment().set('s', 0).format(),
    ];
  }
}

/** 获取utc时间范围 */
export function getUtcTimeRange(timeRange: ITimeRange) {
  if(!timeRange){
    return []
  }
  let startTime = '';
  let endTime = '';
  // 先转换时间
  if (timeRange.type === 'custom') {
    startTime = getUtcTime(timeRange.custom[0]);
    endTime = getUtcTime(timeRange.custom[1]);
  } else {
    // 为了防止起止时间计算出现偏差，这里采用统一的当前时间
    const t = new Date().setSeconds(0);
    // 转换时间
    endTime = getUtcTime(t);
    startTime = getUtcTime(getRelativeTime(timeRange.range, timeRange.unit, t));
  }
  return [startTime, endTime];
}

/**
 * 获取时间差 单位是s
 */
export const getTimeDiff = (timeRange: ITimeRange) => {
  const [startTime, endTime] = getTimeRange(timeRange);
  return moment(endTime).diff(moment(startTime)).valueOf() / 1000;
};

/** 获取时间范围最小值 */
export function getMinTimeFromRange(timeRange: ITimeRange) {
  if (timeRange?.type === 'custom') {
    return timeRange?.custom[0];
  } else {
    return moment()
      .subtract(
        Math.abs((timeRange?.range! as number) || 0),
        timeRange?.unit as any,
      )
      .format();
  }
}

/** 获取时间范围最大值 */
export function getMaxTimeFromRange(timeRange: ITimeRange) {
  if (timeRange?.type === 'custom') {
    return timeRange?.custom[1];
  } else {
    return moment().format();
  }
}

/** 合并范围 */
export function mergeTimeRange(originRange: ITimeRange, newRange: ITimeRange) {
  const originStart = getMinTimeFromRange(originRange);
  const newStart = getMinTimeFromRange(newRange);
  const originEnd = getMaxTimeFromRange(originRange);
  const newEnd = getMaxTimeFromRange(newRange);
  return {
    type: 'custom',
    custom: [
      originStart < newStart ? originStart : newStart,
      originEnd < newEnd ? newEnd : originEnd,
    ],
    unit: 'm',
    include_lower: true,
    include_upper: true,
  } as ITimeRange;
}

export const getIntervalFromRange = (
  time_grain: '1m' | '5m' | '1h' | undefined,
) => {
  if (time_grain === '1m') {
    return 60000;
  } else if (time_grain === '1h') {
    return 3600000;
  } else if (time_grain === '5m') {
    return 300000;
  }
  return 60000;
};

export const getBorderTime = (
  startTime: string | number,
  endTime: string | number,
  interval: number,
) => {
  const start = moment(startTime);
  const end = moment(endTime);
  if (interval === 60000) {
    if (end.second() > 0) {
      return [
        start.set('s', 0).valueOf(),
        end.set('s', 0).add('m', 1).valueOf(),
      ];
    }
    return [start.set('s', 0).valueOf(), end.set('s', 0).valueOf()];
  } else if (interval === 3600000) {
    if (end.minute() > 0) {
      return [
        start.set('s', 0).set('m', 0).valueOf(),
        end.set('s', 0).set('m', 0).add('h', 1).valueOf(),
      ];
    }
    return [
      start.set('s', 0).set('m', 0).valueOf(),
      end.set('s', 0).set('m', 0).valueOf(),
    ];
  } else if (interval === 300000) {
    const startM = Math.floor(start.minute() / 5) * 5;
    const endM = Math.ceil(end.minute() / 5) * 5;
    return [
      start.set('m', startM).set('s', 0).valueOf(),
      end.set('m', endM).set('s', 0).valueOf(),
    ];
  }
  return [start.valueOf(), end.valueOf()];
};

export function formatTime(time: string | number) {
  return moment(time).format();
}

export function formatUtcTime(time: string) {
  return moment(time).add(8, 'h').format('YYYY-MM-DD HH:mm:ss');
}

export function getTimeIntersection(
  times: [string | number, string | number][],
) {
  // 创建一个空数组来存储交集结果
  let intersection: [string, string][] = [];

  if (times.length === 0) {
    return intersection;
  }

  const originStartTime = moment(times[0][0]).valueOf();
  const originEndTime = moment(times[0][1]).valueOf();
  for (let i = 1; i < times.length; i++) {
    const currentStartTime = moment(times[i][0]).valueOf();
    const currentEndTime = moment(times[i][1]).valueOf();

    // 如果当前时间不为空且长度大于等于2（起始时间和结束时间）
    if (currentStartTime && currentEndTime) {
      // 对比当前时间与之前的时间是否相交
      const isOverlap =
        originStartTime <= currentEndTime && originEndTime >= currentStartTime;

      // 如果相交则添加到交集数组中
      if (isOverlap) {
        intersection.push([
          moment(Math.max(originStartTime, currentStartTime)).format(),
          moment(Math.min(originEndTime, currentStartTime)).format(),
        ]);
      } else {
        break;
      }
    }
  }

  return intersection;
}

export function timeRangeEmpty(timeRange: ITimeRange | undefined) {
  if (!timeRange) {
    return true;
  }
  if (
    (!timeRange.custom || timeRange.custom?.toString() === ',') &&
    !timeRange.range
  ) {
    return true;
  }
  return false;
}
