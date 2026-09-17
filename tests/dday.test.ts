import { describe, expect, it } from 'vitest';
import { daysUntil, ddayLabel, isSoon, upcomingCountdowns } from '@/lib/dday';
import { CalendarEvent, EventKind } from '@/lib/types';

function event(
  id: string,
  start_date: string,
  {
    pinned = true,
    end_date = null,
    kind = 'plan' as EventKind,
  }: { pinned?: boolean; end_date?: string | null; kind?: EventKind } = {}
): CalendarEvent {
  return {
    id,
    title: id,
    description: null,
    start_date,
    end_date,
    start_time: null,
    kind,
    pinned,
    created_at: '2026-01-01T00:00:00Z',
  };
}

const TODAY = '2026-09-17';

describe('daysUntil', () => {
  it('오늘은 0 이다', () => {
    expect(daysUntil(TODAY, TODAY)).toBe(0);
  });

  it('앞날은 양수, 지난 날은 음수다', () => {
    expect(daysUntil('2026-09-18', TODAY)).toBe(1);
    expect(daysUntil('2026-09-16', TODAY)).toBe(-1);
  });

  it('달과 해를 넘어가도 이어서 센다', () => {
    expect(daysUntil('2026-10-01', TODAY)).toBe(14);
    expect(daysUntil('2027-09-17', TODAY)).toBe(365);
  });

  it('윤년의 2월을 빠뜨리지 않는다', () => {
    expect(daysUntil('2028-03-01', '2028-02-28')).toBe(2);
  });
});

describe('ddayLabel', () => {
  it('당일은 D-DAY 다', () => {
    expect(ddayLabel(0)).toBe('D-DAY');
  });

  it('남았으면 D-, 지났으면 D+ 다', () => {
    expect(ddayLabel(14)).toBe('D-14');
    expect(ddayLabel(-3)).toBe('D+3');
  });
});

describe('upcomingCountdowns', () => {
  it('띄우기로 표시한 것만 고른다', () => {
    const items = upcomingCountdowns(
      [event('a', '2026-09-20'), event('b', '2026-09-21', { pinned: false })],
      TODAY
    );

    expect(items.map((item) => item.event.id)).toEqual(['a']);
  });

  it('가까운 날부터 온다', () => {
    const items = upcomingCountdowns(
      [event('먼', '2026-10-01'), event('가까운', '2026-09-18')],
      TODAY
    );

    expect(items.map((item) => item.event.id)).toEqual(['가까운', '먼']);
  });

  it('지난 일정은 빠진다', () => {
    expect(upcomingCountdowns([event('a', '2026-09-16')], TODAY)).toEqual([]);
  });

  it('오늘인 일정은 남는다', () => {
    const items = upcomingCountdowns([event('a', TODAY)], TODAY);
    expect(items[0].days).toBe(0);
  });

  it('여러 날짜에 걸친 일정은 마지막 날까지 진행 중으로 남는다', () => {
    const items = upcomingCountdowns(
      [event('시험기간', '2026-09-15', { end_date: '2026-09-19' })],
      TODAY
    );

    expect(items[0].ongoing).toBe(true);
    expect(items[0].days).toBe(-2);
  });

  it('걸쳐 있던 일정도 마지막 날이 지나면 빠진다', () => {
    const items = upcomingCountdowns(
      [event('시험기간', '2026-09-10', { end_date: '2026-09-16' })],
      TODAY
    );

    expect(items).toEqual([]);
  });

  it('진행 중인 것이 앞으로 온다', () => {
    const items = upcomingCountdowns(
      [
        event('내일', '2026-09-18'),
        event('진행중', '2026-09-16', { end_date: '2026-09-20' }),
      ],
      TODAY
    );

    expect(items.map((item) => item.event.id)).toEqual(['진행중', '내일']);
  });

  it('정해둔 개수까지만 낸다', () => {
    const items = upcomingCountdowns(
      ['2026-09-18', '2026-09-19', '2026-09-20', '2026-09-21'].map((date) =>
        event(date, date)
      ),
      TODAY,
      3
    );

    expect(items).toHaveLength(3);
  });
});

describe('isSoon', () => {
  const [near] = upcomingCountdowns([event('a', '2026-09-24')], TODAY);
  const [far] = upcomingCountdowns([event('b', '2026-09-25')], TODAY);

  it('일주일 안이면 코앞이다', () => {
    expect(near.days).toBe(7);
    expect(isSoon(near)).toBe(true);
  });

  it('일주일을 넘으면 아니다', () => {
    expect(far.days).toBe(8);
    expect(isSoon(far)).toBe(false);
  });

  it('진행 중이면 남은 날과 상관없이 코앞이다', () => {
    const [ongoing] = upcomingCountdowns(
      [event('c', '2026-08-01', { end_date: '2026-10-01' })],
      TODAY
    );

    expect(ongoing.days).toBeLessThan(-7);
    expect(isSoon(ongoing)).toBe(true);
  });
});
