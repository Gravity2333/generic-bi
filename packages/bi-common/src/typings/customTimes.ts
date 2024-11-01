export enum EWeek {
  MONDAY = 'Monday',
  Tuesday = 'Tuesday',
  Wednesday = 'Wednesday',
  Thursday = 'Thursday',
  Friday = 'Friday',
  Saturday = 'Saturday',
  Sunday = 'Sunday',
}

export const weekValue: Record<`${EWeek}`, string> = {
  [EWeek.MONDAY]: '1',
  [EWeek.Tuesday]: '2',
  [EWeek.Wednesday]: '3',
  [EWeek.Thursday]: '4',
  [EWeek.Friday]: '5',
  [EWeek.Saturday]: '6',
  [EWeek.Sunday]: '7',
};

export enum ECustomTimeType {
  'PeriodicTime' = '0',
  'DisposableTime' = '1',
}

export interface ICustomTime {
  name: string;
  id?: string;
  period?: string;
  type: ECustomTimeType;
  custom_time_setting: string;
}
