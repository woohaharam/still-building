import { describe, expect, it } from 'vitest';
import {
  buildMonthMatrix,
  eventDateKeys,
  isSameMonth,
  parseDateKey,
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
    const days = buildMonthMatrix(2026, 7).filter((d) => isSameMonth(d, 2026, 7));
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
