import { fixedZero, getRelativeTime, getTimeZone, getUtcTime } from '..';

describe('test function getTimeZone()', () => {
  test('should be return +08:00', () => {
    expect(getTimeZone()).toEqual('+08:00');
  });
});

describe('test function fixedZero()', () => {
  test('should be return 01', () => {
    expect(fixedZero(1)).toEqual('01');
  });
  test('should be return 12', () => {
    expect(fixedZero(12)).toEqual('12');
  });
});

describe('test function getUtcTime()', () => {
  test('test getUtcTime() from Date', () => {
    expect(getUtcTime(new Date('2021-12-09 18:00:00'))).toEqual(
      '2021-12-09 10:00:00',
    );
  });

  test('test getUtcTime() from timestamp', () => {
    expect(getUtcTime(new Date('2021-12-09 18:00:00').valueOf())).toEqual(
      '2021-12-09 10:00:00',
    );
  });

  test('test getUtcTime() from ISO8601', () => {
    expect(getUtcTime('2021-12-09T18:00:00+0800')).toEqual(
      '2021-12-09 10:00:00',
    );
    expect(getUtcTime('2021-12-09T18:00:00+08:00')).toEqual(
      '2021-12-09 10:00:00',
    );
    expect(getUtcTime('2021-12-09T18:00:00Z')).toEqual('2021-12-09 18:00:00');
  });
});

describe('test function getRelativeTime()', () => {
  const t = new Date('2021-12-09T18:00:00+08:00');
  test('now-1s', () => {
    expect(getRelativeTime(-1, 's', t)).toEqual(
      new Date('2021-12-09T17:59:59+08:00').valueOf(),
    );
  });

  test('now+1s', () => {
    expect(getRelativeTime(1, 's', t)).toEqual(
      new Date('2021-12-09T18:00:01+08:00').valueOf(),
    );
  });

  test('now-1m', () => {
    expect(getRelativeTime(-1, 'm', t)).toEqual(
      new Date('2021-12-09T17:59:00+08:00').valueOf(),
    );
  });
  test('now-1h', () => {
    expect(getRelativeTime(-1, 'h', t)).toEqual(
      new Date('2021-12-09T17:00:00+08:00').valueOf(),
    );
  });
  test('now+1h', () => {
    expect(getRelativeTime(1, 'h', t)).toEqual(
      new Date('2021-12-09T19:00:00+08:00').valueOf(),
    );
  });
  test('now-1H', () => {
    expect(getRelativeTime(-1, 'H', t)).toEqual(
      new Date('2021-12-09T17:00:00+08:00').valueOf(),
    );
  });
  test('now+1H', () => {
    expect(getRelativeTime(1, 'H', t)).toEqual(
      new Date('2021-12-09T19:00:00+08:00').valueOf(),
    );
  });
  test('now-1d', () => {
    expect(getRelativeTime(-1, 'd', t)).toEqual(
      new Date('2021-12-08T18:00:00+08:00').valueOf(),
    );
  });
  test('now+1d', () => {
    expect(getRelativeTime(1, 'd', t)).toEqual(
      new Date('2021-12-10T18:00:00+08:00').valueOf(),
    );
  });
  test('now-1w', () => {
    expect(getRelativeTime(-1, 'w', t)).toEqual(
      new Date('2021-12-02T18:00:00+08:00').valueOf(),
    );
  });
  test('now+1w', () => {
    expect(getRelativeTime(1, 'w', t)).toEqual(
      new Date('2021-12-16T18:00:00+08:00').valueOf(),
    );
  });
  test('now-1M', () => {
    expect(getRelativeTime(-1, 'M', t)).toEqual(
      new Date('2021-11-09T18:00:00+08:00').valueOf(),
    );
  });
  test('now+1M', () => {
    expect(getRelativeTime(1, 'M', t)).toEqual(
      new Date('2022-01-09T18:00:00+08:00').valueOf(),
    );
  });
  test('now-1y', () => {
    expect(getRelativeTime(-1, 'y', t)).toEqual(
      new Date('2020-12-09T18:00:00+08:00').valueOf(),
    );
  });
  test('now+1y', () => {
    expect(getRelativeTime(1, 'y', t)).toEqual(
      new Date('2022-12-09T18:00:00+08:00').valueOf(),
    );
  });
});
