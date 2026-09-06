import { describe, expect, it } from 'vitest';
import {
  buildLeaveIndex,
  leaveDateKeys,
  leaveNow,
  leaveOn,
  leaveTimeLabel,
  leaveWindow,
  upcomingLeaves,
} from '@/lib/leave-dates';
import { Leave, LeaveKind } from '@/lib/types';

function leave(
  id: string,
  kind: LeaveKind,
  started_on: string,
  ended_on: string | null = null,
  left_at: string | null = null,
  returned_at: string | null = null
): Leave {
  return {
    id,
    kind,
    started_on,
    ended_on,
    left_at,
    returned_at,
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

describe('leaveOn', () => {
  it('걸쳐 있는 날이면 그 일정을 준다', () => {
    const trip = leave('a', 'leave', '2026-09-10', '2026-09-13');

    expect(leaveOn([trip], '2026-09-10')?.id).toBe('a');
    expect(leaveOn([trip], '2026-09-12')?.id).toBe('a');
    expect(leaveOn([trip], '2026-09-13')?.id).toBe('a');
  });

  it('양 끝 밖이면 없다', () => {
    const trip = leave('a', 'leave', '2026-09-10', '2026-09-13');

    expect(leaveOn([trip], '2026-09-09')).toBeNull();
    expect(leaveOn([trip], '2026-09-14')).toBeNull();
  });

  it('하루짜리는 그날만 걸린다', () => {
    const day = leave('a', 'outing', '2026-09-10', null);

    expect(leaveOn([day], '2026-09-10')?.id).toBe('a');
    expect(leaveOn([day], '2026-09-11')).toBeNull();
  });

  it('겹치면 목록에서 앞선 쪽, 곧 나중에 적은 쪽이 이긴다', () => {
    const recent = leave('나중', 'leave', '2026-09-10', '2026-09-12');
    const older = leave('먼저', 'outing', '2026-09-11', null);

    expect(leaveOn([recent, older], '2026-09-11')?.id).toBe('나중');
  });

  it('비어 있으면 없다', () => {
    expect(leaveOn([], '2026-09-10')).toBeNull();
  });
});

/** 'HH:MM' 을 자정에서 몇 분인지로. 테스트를 읽기 쉽게 하려고 둔다. */
function at(clock: string): number {
  const [hour, minute] = clock.split(':').map(Number);
  return hour * 60 + minute;
}

describe('leaveWindow', () => {
  it('평일외출은 13:30 나가 21:30 들어온다', () => {
    expect(leaveWindow(leave('a', 'outing', '2026-09-10'))).toEqual({
      leftAt: at('13:30'),
      returnedAt: at('21:30'),
    });
  });

  it('휴가 출영은 나가는 날이 평일이면 06:30', () => {
    // 2026-09-10 은 목요일
    expect(leaveWindow(leave('a', 'leave', '2026-09-10')).leftAt).toBe(
      at('06:30')
    );
  });

  it('휴가 출영은 나가는 날이 주말이면 07:00', () => {
    // 2026-09-12 토요일, 2026-09-13 일요일
    expect(leaveWindow(leave('a', 'leave', '2026-09-12')).leftAt).toBe(
      at('07:00')
    );
    expect(leaveWindow(leave('a', 'leave', '2026-09-13')).leftAt).toBe(
      at('07:00')
    );
  });

  it('복귀는 주말이어도 21:30 로 같다', () => {
    expect(leaveWindow(leave('a', 'leave', '2026-09-12')).returnedAt).toBe(
      at('21:30')
    );
  });

  it('적어둔 시각이 규정값을 이긴다', () => {
    const 특별외출 = leave(
      'a',
      'special_outing',
      '2026-09-10',
      null,
      '08:00',
      '20:00'
    );

    expect(leaveWindow(특별외출)).toEqual({
      leftAt: at('08:00'),
      returnedAt: at('20:00'),
    });
  });

  it("Postgres 가 주는 'HH:MM:SS' 도 읽는다", () => {
    const 일정 = leave('a', 'outing', '2026-09-10', null, '09:15:00');

    expect(leaveWindow(일정).leftAt).toBe(at('09:15'));
  });

  it('한쪽만 적어두면 나머지는 규정값을 쓴다', () => {
    const 일정 = leave('a', 'outing', '2026-09-10', null, '10:00', null);

    expect(leaveWindow(일정)).toEqual({
      leftAt: at('10:00'),
      returnedAt: at('21:30'),
    });
  });

  it('말출은 나가는 시각만 있고 복귀가 없다', () => {
    expect(
      leaveWindow(leave('a', 'final', '2026-09-10')).returnedAt
    ).toBeNull();
  });

  it('OFF 는 양쪽 다 없다', () => {
    expect(leaveWindow(leave('a', 'off', '2026-09-10'))).toEqual({
      leftAt: null,
      returnedAt: null,
    });
  });
});

describe('leaveNow', () => {
  const 외출 = leave('외출', 'outing', '2026-09-10');
  const 휴가 = leave('휴가', 'leave', '2026-09-10', '2026-09-13');

  it('출영 전에는 아직 부대에 있다', () => {
    expect(leaveNow([외출], '2026-09-10', at('13:29'))).toBeNull();
  });

  it('출영 시각이 되면 나간 것으로 본다', () => {
    expect(leaveNow([외출], '2026-09-10', at('13:30'))?.id).toBe('외출');
    expect(leaveNow([외출], '2026-09-10', at('21:29'))?.id).toBe('외출');
  });

  it('복귀 시각이 되면 들어온 것으로 본다', () => {
    expect(leaveNow([외출], '2026-09-10', at('21:30'))).toBeNull();
    expect(leaveNow([외출], '2026-09-10', at('23:59'))).toBeNull();
  });

  it('여러 날 휴가는 나가는 날 출영 시각부터다', () => {
    expect(leaveNow([휴가], '2026-09-10', at('06:29'))).toBeNull();
    expect(leaveNow([휴가], '2026-09-10', at('06:30'))?.id).toBe('휴가');
  });

  it('중간 날들은 온종일 나가 있다', () => {
    expect(leaveNow([휴가], '2026-09-11', at('00:00'))?.id).toBe('휴가');
    expect(leaveNow([휴가], '2026-09-12', at('23:59'))?.id).toBe('휴가');
  });

  it('복귀하는 날은 21:30 에 꺼진다', () => {
    expect(leaveNow([휴가], '2026-09-13', at('21:29'))?.id).toBe('휴가');
    expect(leaveNow([휴가], '2026-09-13', at('21:30'))).toBeNull();
  });

  it('적어둔 시각이 있으면 그대로 따른다', () => {
    const 특별외출 = leave(
      '특별',
      'special_outing',
      '2026-09-10',
      null,
      '08:00',
      '20:00'
    );

    expect(leaveNow([특별외출], '2026-09-10', at('07:59'))).toBeNull();
    expect(leaveNow([특별외출], '2026-09-10', at('08:00'))?.id).toBe('특별');
    expect(leaveNow([특별외출], '2026-09-10', at('20:00'))).toBeNull();
  });

  it('시각이 없는 종류는 온종일 그 상태다', () => {
    const off = leave('off', 'off', '2026-09-10');

    expect(leaveNow([off], '2026-09-10', at('00:00'))?.id).toBe('off');
    expect(leaveNow([off], '2026-09-10', at('23:59'))?.id).toBe('off');
  });

  it('아직 안 나갔거나 이미 들어온 일정이 다른 일정을 가리지 않는다', () => {
    const 들어온휴가 = leave('휴가', 'leave', '2026-09-08', '2026-09-10');
    const off = leave('off', 'off', '2026-09-10');

    expect(leaveNow([들어온휴가, off], '2026-09-10', at('22:00'))?.id).toBe(
      'off'
    );
  });

  it('날짜 밖이면 시각과 상관없이 없다', () => {
    expect(leaveNow([외출], '2026-09-09', at('15:00'))).toBeNull();
    expect(leaveNow([외출], '2026-09-11', at('15:00'))).toBeNull();
  });
});

describe('leaveTimeLabel', () => {
  it('양쪽이 다 있으면 범위로 적는다', () => {
    expect(leaveTimeLabel(leave('a', 'outing', '2026-09-10'))).toBe(
      '13:30 — 21:30'
    );
  });

  it('복귀가 없으면 나가는 시각만', () => {
    expect(leaveTimeLabel(leave('a', 'final', '2026-09-10'))).toBe(
      '13:30 나감'
    );
  });

  it('양쪽 다 없으면 빈 문자열', () => {
    expect(leaveTimeLabel(leave('a', 'off', '2026-09-10'))).toBe('');
  });
});
