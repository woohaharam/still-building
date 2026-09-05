import { describe, expect, it } from 'vitest';
import {
  groupByYear,
  isPositive,
  periodLabel,
  sortByRecent,
  summarize,
} from '@/lib/activity';
import { Activity, ActivityOutcome } from '@/lib/types';

function activity(
  name: string,
  outcome: ActivityOutcome,
  started_on: string,
  ended_on: string | null = null
): Activity {
  return {
    id: name,
    name,
    organizer: null,
    outcome,
    started_on,
    ended_on,
    note: null,
    published: true,
    created_at: '2026-01-01T00:00:00Z',
  };
}

describe('summarize', () => {
  it('지원 횟수와 실제로 한 것을 따로 센다', () => {
    const list = [
      activity('가', 'done', '2026-03-01'),
      activity('나', 'rejected', '2026-02-01'),
      activity('다', 'ongoing', '2026-01-01'),
      activity('라', 'applied', '2026-04-01'),
    ];
    expect(summarize(list)).toEqual({ applied: 4, engaged: 2 });
  });

  it('빈 목록은 0이다', () => {
    expect(summarize([])).toEqual({ applied: 0, engaged: 0 });
  });

  it('떨어진 것만 있어도 지원 횟수는 센다', () => {
    // 붙은 것만 세면 몇 번 시도했는지가 사라진다.
    const list = [activity('가', 'rejected', '2026-01-01')];
    expect(summarize(list)).toEqual({ applied: 1, engaged: 0 });
  });
});

describe('sortByRecent', () => {
  it('최근 시작한 것부터 낸다', () => {
    const list = [
      activity('오래된', 'done', '2025-01-01'),
      activity('최근', 'done', '2026-05-01'),
    ];
    expect(sortByRecent(list).map((a) => a.name)).toEqual(['최근', '오래된']);
  });

  it('같은 날이면 이름순으로 고정한다', () => {
    // 기준이 하나뿐이면 새로고침할 때마다 순서가 흔들린다.
    const list = [
      activity('나중', 'done', '2026-01-01'),
      activity('가나다', 'done', '2026-01-01'),
    ];
    expect(sortByRecent(list).map((a) => a.name)).toEqual(['가나다', '나중']);
  });

  it('받은 배열을 건드리지 않는다', () => {
    const list = [
      activity('가', 'done', '2025-01-01'),
      activity('나', 'done', '2026-01-01'),
    ];
    sortByRecent(list);
    expect(list.map((a) => a.name)).toEqual(['가', '나']);
  });
});

describe('groupByYear', () => {
  it('연도별로 묶고 최근 연도부터 낸다', () => {
    const list = [
      activity('가', 'done', '2025-06-01'),
      activity('나', 'done', '2026-03-01'),
      activity('다', 'done', '2026-01-01'),
    ];
    const groups = groupByYear(list);
    expect(groups.map((g) => g.year)).toEqual(['2026', '2025']);
    expect(groups[0].items.map((a) => a.name)).toEqual(['나', '다']);
  });

  it('빈 목록은 빈 배열이다', () => {
    expect(groupByYear([])).toEqual([]);
  });
});

describe('periodLabel', () => {
  it('끝난 날이 없으면 시작만 보여준다', () => {
    expect(periodLabel(activity('가', 'done', '2026-03-01'))).toBe('2026.03');
  });

  it('같은 달이면 한 번만 보여준다', () => {
    expect(
      periodLabel(activity('가', 'done', '2026-03-01', '2026-03-20'))
    ).toBe('2026.03');
  });

  it('달이 다르면 이어서 보여준다', () => {
    expect(
      periodLabel(activity('가', 'done', '2026-03-01', '2026-06-30'))
    ).toBe('2026.03 — 2026.06');
  });
});

describe('isPositive', () => {
  it('활동한 것과 활동 중인 것만 강조한다', () => {
    expect(isPositive('done')).toBe(true);
    expect(isPositive('ongoing')).toBe(true);
    expect(isPositive('applied')).toBe(false);
    expect(isPositive('rejected')).toBe(false);
  });
});
