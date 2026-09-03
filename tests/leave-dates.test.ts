import { describe, expect, it } from 'vitest';
import {
  buildLeaveIndex,
  leaveDateKeys,
  upcomingLeaves,
} from '@/lib/leave-dates';
import { Leave, LeaveKind } from '@/lib/types';

function leave(
  id: string,
  kind: LeaveKind,
  started_on: string,
  ended_on: string | null = null
): Leave {
  return {
    id,
    kind,
    started_on,
    ended_on,
    note: null,
    created_at: '2026-01-01T00:00:00Z',
  };
}

describe('leaveDateKeys', () => {
  it('하루짜리는 그 날 하나다', () => {
    expect(leaveDateKeys(leave('1', 'outing', '2026-09-05'))).toEqual([
      '2026-09-05',
    ]);
  });

  it('걸쳐 있는 날을 모두 낸다', () => {
    expect(
      leaveDateKeys(leave('1', 'leave', '2026-09-05', '2026-09-07'))
    ).toEqual(['2026-09-05', '2026-09-06', '2026-09-07']);
  });

  it('달을 넘어가도 이어진다', () => {
    const keys = leaveDateKeys(leave('1', 'leave', '2026-09-29', '2026-10-02'));
    expect(keys).toEqual([
      '2026-09-29',
      '2026-09-30',
      '2026-10-01',
      '2026-10-02',
    ]);
  });

  it('끝난 날이 시작보다 빠르면 하루로 본다', () => {
    expect(
      leaveDateKeys(leave('1', 'outing', '2026-09-07', '2026-09-05'))
    ).toEqual(['2026-09-07']);
  });

  it('종료일을 아주 멀리 적어도 멈추지 않는다', () => {
    // 실수로 2099년을 넣어도 달력이 얼어붙지 않아야 한다.
    const keys = leaveDateKeys(leave('1', 'leave', '2026-01-01', '2099-01-01'));
    expect(keys.length).toBe(366);
  });
});

describe('buildLeaveIndex', () => {
  it('걸친 날마다 찾을 수 있다', () => {
    const index = buildLeaveIndex([
      leave('1', 'leave', '2026-09-05', '2026-09-07'),
    ]);
    expect(index.get('2026-09-06')?.id).toBe('1');
    expect(index.get('2026-09-08')).toBeUndefined();
  });

  it('겹치면 최근에 적은 쪽이 남는다', () => {
    // 목록이 최신순으로 들어온다.
    const index = buildLeaveIndex([
      leave('new', 'final', '2026-09-05'),
      leave('old', 'outing', '2026-09-05'),
    ]);
    expect(index.get('2026-09-05')?.id).toBe('new');
  });

  it('빈 목록은 빈 표다', () => {
    expect(buildLeaveIndex([]).size).toBe(0);
  });
});

describe('upcomingLeaves', () => {
  const list = [
    leave('3', 'leave', '2026-10-01', '2026-10-05'),
    leave('2', 'outing', '2026-09-10'),
    leave('1', 'outing', '2026-08-01'),
  ];

  it('안 지난 것만 가까운 날부터 낸다', () => {
    expect(upcomingLeaves(list, '2026-09-03').map((l) => l.id)).toEqual([
      '2',
      '3',
    ]);
  });

  it('진행 중인 일정은 남긴다', () => {
    // 10월 3일이면 10월 1~5일 휴가는 아직 안 끝났다.
    expect(upcomingLeaves(list, '2026-10-03').map((l) => l.id)).toEqual(['3']);
  });

  it('당일도 남긴다', () => {
    expect(upcomingLeaves(list, '2026-09-10').map((l) => l.id)).toContain('2');
  });
});
