import { describe, expect, it } from 'vitest';
import {
  buildMonthMatrix,
  eventDateKeys,
  formatDate,
  formatShortDay,
  isSameMonth,
  parseDateKey,
  seoulDateKey,
  seoulMinutes,
  seoulToday,
  toDateKey,
} from '@/lib/calendar';
import { CalendarEvent } from '@/lib/types';

function makeEvent(start: string, end: string | null = null): CalendarEvent {
  return {
    id: 'e1',
    title: '일정',
    description: null,
    start_date: start,
    end_date: end,
    start_time: null,
    kind: 'plan',
    pinned: false,
    created_at: '',
  };
}

describe('toDateKey', () => {
  it('한 자리 월·일을 0으로 채운다', () => {
    expect(toDateKey(new Date(2026, 0, 5))).toBe('2026-01-05');
  });

  it('두 자리는 그대로 둔다', () => {
    expect(toDateKey(new Date(2026, 11, 25))).toBe('2026-12-25');
  });
});

describe('parseDateKey', () => {
  // new Date('2026-08-19')는 UTC 자정으로 해석돼서 시간대에 따라 하루 밀린다.
  // 이 함수는 어느 시간대에서 돌려도 같은 날짜여야 한다.
  it('시간대와 무관하게 적힌 그 날짜를 준다', () => {
    const date = parseDateKey('2026-08-19');
    expect(date.getFullYear()).toBe(2026);
    expect(date.getMonth()).toBe(7);
    expect(date.getDate()).toBe(19);
  });

  it('toDateKey와 왕복해도 값이 유지된다', () => {
    for (const key of ['2026-01-01', '2026-08-19', '2026-12-31']) {
      expect(toDateKey(parseDateKey(key))).toBe(key);
    }
  });
});

describe('buildMonthMatrix', () => {
  it('일요일부터 시작한다', () => {
    const days = buildMonthMatrix(2026, 7);
    expect(days[0].getDay()).toBe(0);
  });

  it('칸 수가 항상 7의 배수다', () => {
    for (let month = 0; month < 12; month += 1) {
      expect(buildMonthMatrix(2026, month).length % 7).toBe(0);
    }
  });

  it('그 달의 모든 날을 담는다', () => {
    const days = buildMonthMatrix(2026, 7).filter((d) =>
      isSameMonth(d, 2026, 7)
    );
    expect(days.length).toBe(31);
  });

  it('1일이 일요일인 달도 빈 줄을 앞에 두지 않는다', () => {
    // 2026년 3월 1일은 일요일
    const days = buildMonthMatrix(2026, 2);
    expect(toDateKey(days[0])).toBe('2026-03-01');
  });
});

describe('eventDateKeys', () => {
  it('하루짜리는 하나만 준다', () => {
    expect(eventDateKeys(makeEvent('2026-08-19'))).toEqual(['2026-08-19']);
  });

  it('여러 날에 걸치면 사이 날짜를 모두 채운다', () => {
    expect(eventDateKeys(makeEvent('2026-08-19', '2026-08-22'))).toEqual([
      '2026-08-19',
      '2026-08-20',
      '2026-08-21',
      '2026-08-22',
    ]);
  });

  it('달을 넘어가도 이어진다', () => {
    expect(eventDateKeys(makeEvent('2026-08-30', '2026-09-02'))).toEqual([
      '2026-08-30',
      '2026-08-31',
      '2026-09-01',
      '2026-09-02',
    ]);
  });

  it('종료일이 시작일보다 빠르면 시작일만 준다', () => {
    expect(eventDateKeys(makeEvent('2026-08-19', '2026-08-01'))).toEqual([
      '2026-08-19',
    ]);
  });

  it('종료일을 아주 멀리 적어도 무한정 늘어나지 않는다', () => {
    const keys = eventDateKeys(makeEvent('2026-01-01', '2099-01-01'));
    expect(keys.length).toBeLessThanOrEqual(366);
  });
});

describe('seoulDateKey', () => {
  it('UTC 로는 아직 어제인 시각도 한국 날짜로 준다', () => {
    // 한국 시간 2027-04-27 오전 8시. UTC 로는 아직 26일 밤이다.
    expect(seoulDateKey(new Date('2027-04-26T23:00:00Z'))).toBe('2027-04-27');
  });

  it('한국 자정 직전과 직후가 갈린다', () => {
    expect(seoulDateKey(new Date('2027-04-26T14:59:59Z'))).toBe('2027-04-26');
    expect(seoulDateKey(new Date('2027-04-26T15:00:00Z'))).toBe('2027-04-27');
  });

  it('parseDateKey 가 읽을 수 있는 모양으로 준다', () => {
    const key = seoulDateKey(new Date('2026-09-06T01:23:45Z'));

    expect(key).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(toDateKey(parseDateKey(key))).toBe(key);
  });
});

describe('seoulMinutes', () => {
  it('한국 시각을 자정에서 몇 분인지로 준다', () => {
    // UTC 11:30 = 한국 20:30
    expect(seoulMinutes(new Date('2026-09-10T11:30:00Z'))).toBe(20 * 60 + 30);
  });

  it('한국 자정은 24시가 아니라 0분이다', () => {
    expect(seoulMinutes(new Date('2026-09-10T15:00:00Z'))).toBe(0);
  });

  it('하루 범위 안에 있다', () => {
    for (let hour = 0; hour < 24; hour++) {
      const at = new Date(Date.UTC(2026, 8, 10, hour, 0, 0));
      const minutes = seoulMinutes(at);

      expect(minutes).toBeGreaterThanOrEqual(0);
      expect(minutes).toBeLessThan(1440);
    }
  });
});

describe('formatShortDay', () => {
  it('달과 날과 요일을 짧게 적는다', () => {
    expect(formatShortDay('2026-09-22')).toBe('9.22 (화)');
  });

  it('한 자리 날은 0 을 채운다', () => {
    expect(formatShortDay('2026-09-01')).toBe('9.01 (화)');
  });

  it('달은 0 을 채우지 않는다', () => {
    expect(formatShortDay('2026-01-05')).toBe('1.05 (월)');
  });
});

describe('formatDate', () => {
  it('한국어 날짜로 적는다', () => {
    expect(formatDate('2026-08-25T12:00:00')).toBe('2026년 8월 25일');
  });

  it('한 자리 월·일에 0을 붙이지 않는다', () => {
    expect(formatDate('2026-01-05T12:00:00')).toBe('2026년 1월 5일');
  });

  it('값이 없으면 빈 문자열', () => {
    expect(formatDate(null)).toBe('');
    expect(formatDate('')).toBe('');
  });

  /*
    전에는 이 줄이 없었다. 시각이 붙은 값만 검사해서, 날짜만 있는 값이
    new Date 에 그대로 들어가 UTC 자정으로 읽히는 걸 못 잡았다.
  */
  it('날짜만 있는 값은 시간대에 밀리지 않는다', () => {
    expect(formatDate('2027-04-27')).toBe('2027년 4월 27일');
    expect(formatDate('2026-01-01')).toBe('2026년 1월 1일');
  });
});

describe('seoulDateKey', () => {
  it('한국 기준 날짜를 낸다', () => {
    // UTC 로는 9월 19일 16시지만 서울은 이미 20일이다.
    expect(seoulDateKey(new Date('2026-09-19T16:00:00Z'))).toBe('2026-09-20');
    expect(seoulDateKey(new Date('2026-09-19T14:00:00Z'))).toBe('2026-09-19');
  });

  it('함수인 채로 넘길 수 있다 — useState(seoulDateKey) 가 이걸 쓴다', () => {
    const lazy: () => string = seoulDateKey;
    expect(lazy()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe('seoulToday', () => {
  it('한국 기준 오늘의 연·월·일을 담는다', () => {
    const date = seoulToday(new Date('2026-09-19T16:00:00Z'));

    expect(date.getFullYear()).toBe(2026);
    expect(date.getMonth()).toBe(8);
    expect(date.getDate()).toBe(20);
  });

  it('날짜 키와 같은 날을 가리킨다', () => {
    const now = new Date('2027-01-01T00:30:00+09:00');
    expect(toDateKey(seoulToday(now))).toBe(seoulDateKey(now));
  });
});
