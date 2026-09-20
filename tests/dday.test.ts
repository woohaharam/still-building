import { describe, expect, it } from 'vitest';
import {
  Dated,
  daysUntil,
  ddayLabel,
  fromEvents,
  fromLeaves,
  isSoon,
  upcomingCountdowns,
} from '@/lib/dday';
import { CalendarEvent, EventKind, Leave, LeaveKind } from '@/lib/types';

const TODAY = '2026-09-17';

function dated(
  id: string,
  startsOn: string,
  endsOn: string | null = null
): Dated {
  return { id, title: id, label: null, startsOn, endsOn, time: null };
}

function event(
  id: string,
  start_date: string,
  { pinned = true, kind = 'plan' as EventKind } = {}
): CalendarEvent {
  return {
    id,
    title: `${id} 제목`,
    description: null,
    start_date,
    end_date: null,
    start_time: null,
    kind,
    pinned,
    created_at: '2026-01-01T00:00:00Z',
  };
}

function leave(
  id: string,
  kind: LeaveKind,
  started_on: string,
  {
    ended_on = null,
    note = null,
  }: { ended_on?: string | null; note?: string | null } = {}
): Leave {
  return {
    id,
    kind,
    started_on,
    ended_on,
    left_at: null,
    returned_at: null,
    note,
    created_at: '2026-01-01T00:00:00Z',
  };
}

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

describe('fromEvents', () => {
  it('띄우기로 표시한 것만 고른다', () => {
    const items = fromEvents([
      event('a', '2026-09-20'),
      event('b', '2026-09-21', { pinned: false }),
    ]);

    expect(items.map((item) => item.title)).toEqual(['a 제목']);
  });

  it('종류를 갈래 이름으로 옮긴다', () => {
    expect(fromEvents([event('a', TODAY, { kind: 'exam' })])[0].label).toBe(
      '시험'
    );
  });
});

describe('fromLeaves', () => {
  it('종류 이름이 제목이 된다', () => {
    const items = fromLeaves([leave('l1', 'leave', '2026-10-01')]);

    expect(items[0].title).toBe('휴가');
    expect(items[0].label).toBe('복무');
  });

  it('메모를 적어뒀으면 갈래 자리에 그게 온다', () => {
    const items = fromLeaves([
      leave('l1', 'special_outing', '2026-10-01', { note: '포상' }),
    ]);

    expect(items[0].label).toBe('포상');
  });

  it('규정 시각을 시각 칸에 채운다', () => {
    expect(fromLeaves([leave('l1', 'outing', '2026-10-01')])[0].time).toBe(
      '13:30 — 21:30'
    );
  });

  it('OFF 는 셀 날이 아니라 빠진다', () => {
    expect(fromLeaves([leave('l1', 'off', '2026-10-01')])).toEqual([]);
  });

  it('일정과 섞여도 id 가 부딪히지 않는다', () => {
    const items = [
      ...fromEvents([event('같은값', TODAY)]),
      ...fromLeaves([leave('같은값', 'leave', TODAY)]),
    ];

    expect(new Set(items.map((item) => item.id)).size).toBe(2);
  });
});

describe('upcomingCountdowns', () => {
  it('가까운 날부터 온다', () => {
    const items = upcomingCountdowns(
      [dated('먼', '2026-10-01'), dated('가까운', '2026-09-18')],
      TODAY
    );

    expect(items.map((item) => item.id)).toEqual(['가까운', '먼']);
  });

  it('일정과 나가는 일정이 한 줄에 섞인다', () => {
    const items = upcomingCountdowns(
      [
        ...fromEvents([event('시험', '2026-09-22')]),
        ...fromLeaves([leave('휴가', 'leave', '2026-09-19')]),
      ],
      TODAY
    );

    expect(items.map((item) => item.title)).toEqual(['휴가', '시험 제목']);
  });

  it('지난 일정은 빠진다', () => {
    expect(upcomingCountdowns([dated('a', '2026-09-16')], TODAY)).toEqual([]);
  });

  it('오늘인 일정은 남는다', () => {
    expect(upcomingCountdowns([dated('a', TODAY)], TODAY)[0].days).toBe(0);
  });

  it('여러 날짜에 걸친 일정은 마지막 날까지 진행 중으로 남는다', () => {
    const items = upcomingCountdowns(
      [dated('시험기간', '2026-09-15', '2026-09-19')],
      TODAY
    );

    expect(items[0].ongoing).toBe(true);
    expect(items[0].days).toBe(-2);
  });

  it('걸쳐 있던 일정도 마지막 날이 지나면 빠진다', () => {
    expect(
      upcomingCountdowns([dated('끝남', '2026-09-10', '2026-09-16')], TODAY)
    ).toEqual([]);
  });

  it('진행 중인 것이 앞으로 온다', () => {
    const items = upcomingCountdowns(
      [
        dated('내일', '2026-09-18'),
        dated('진행중', '2026-09-16', '2026-09-20'),
      ],
      TODAY
    );

    expect(items.map((item) => item.id)).toEqual(['진행중', '내일']);
  });

  it('정해둔 개수까지만 낸다', () => {
    const items = upcomingCountdowns(
      ['2026-09-18', '2026-09-19', '2026-09-20', '2026-09-21'].map((d) =>
        dated(d, d)
      ),
      TODAY,
      3
    );

    expect(items).toHaveLength(3);
  });
});

describe('isSoon', () => {
  const [near] = upcomingCountdowns([dated('a', '2026-09-24')], TODAY);
  const [far] = upcomingCountdowns([dated('b', '2026-09-25')], TODAY);

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
      [dated('c', '2026-08-01', '2026-10-01')],
      TODAY
    );

    expect(ongoing.days).toBeLessThan(-7);
    expect(isSoon(ongoing)).toBe(true);
  });
});
