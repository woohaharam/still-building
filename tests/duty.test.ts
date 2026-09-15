import { describe, expect, it } from 'vitest';
import {
  buildDutySheet,
  crossesMidnight,
  dutyTimeLabel,
  groupDutiesByMonth,
  isDutySlot,
  joBetween,
  slotNumber,
  tallyDuties,
} from '@/lib/duty';
import { Duty, DutySlot } from '@/lib/types';

function duty(
  id: string,
  served_on: string,
  slot: DutySlot,
  day_off_after = false
): Duty {
  return {
    id,
    served_on,
    slot,
    day_off_after,
    note: null,
    created_at: '2026-01-01T00:00:00Z',
  };
}

describe('slotNumber', () => {
  it('근무일 안에서는 오전이 가장 이르고 삼팔이 가장 늦다', () => {
    const day = '2026-09-17';
    const numbers = (['am', 'pm', 'evening', 'late', 'dawn'] as DutySlot[]).map(
      (slot) => slotNumber({ served_on: day, slot })
    );

    expect(numbers).toEqual([...numbers].sort((a, b) => a - b));
  });

  it('하루가 다섯 칸이다', () => {
    expect(
      slotNumber({ served_on: '2026-09-18', slot: 'am' }) -
        slotNumber({ served_on: '2026-09-17', slot: 'am' })
    ).toBe(5);
  });
});

describe('joBetween', () => {
  it('오후 다음 날 오전은 4조', () => {
    expect(
      joBetween(
        { served_on: '2026-09-17', slot: 'pm' },
        { served_on: '2026-09-18', slot: 'am' }
      )
    ).toBe(4);
  });

  it('석간 다음 날 오후도 4조', () => {
    expect(
      joBetween(
        { served_on: '2026-09-17', slot: 'evening' },
        { served_on: '2026-09-18', slot: 'pm' }
      )
    ).toBe(4);
  });

  it('오후 다음 날 열삼은 7조', () => {
    expect(
      joBetween(
        { served_on: '2026-09-17', slot: 'pm' },
        { served_on: '2026-09-18', slot: 'late' }
      )
    ).toBe(7);
  });

  it('노딱 — 같은 날 오전과 삼팔도 4조다', () => {
    expect(
      joBetween(
        { served_on: '2026-09-17', slot: 'am' },
        { served_on: '2026-09-17', slot: 'dawn' }
      )
    ).toBe(4);
  });

  it('순서가 뒤집혀 있으면 세지 않는다', () => {
    expect(
      joBetween(
        { served_on: '2026-09-18', slot: 'am' },
        { served_on: '2026-09-17', slot: 'pm' }
      )
    ).toBeNull();
  });

  it('달을 넘어가도 이어서 센다', () => {
    expect(
      joBetween(
        { served_on: '2026-09-30', slot: 'pm' },
        { served_on: '2026-10-01', slot: 'am' }
      )
    ).toBe(4);
  });
});

describe('buildDutySheet', () => {
  it('최근 근무가 먼저 온다', () => {
    const rows = buildDutySheet([
      duty('1', '2026-09-17', 'pm'),
      duty('2', '2026-09-19', 'am'),
      duty('3', '2026-09-18', 'am'),
    ]);

    expect(rows.map((row) => row.duty.id)).toEqual(['2', '3', '1']);
  });

  it('조는 직전 근무에서 잰다', () => {
    const rows = buildDutySheet([
      duty('1', '2026-09-17', 'pm'),
      duty('2', '2026-09-18', 'am'),
      duty('3', '2026-09-19', 'late'),
    ]);

    // 최근 것이 먼저다.
    expect(rows.map((row) => row.jo)).toEqual([8, 4, null]);
  });

  it('적어둔 순서가 뒤죽박죽이어도 조는 시간순으로 센다', () => {
    const rows = buildDutySheet([
      duty('2', '2026-09-18', 'am'),
      duty('1', '2026-09-17', 'pm'),
    ]);

    expect(rows[0].jo).toBe(4);
    expect(rows[1].jo).toBeNull();
  });

  it('맨 처음 근무는 조가 없다', () => {
    expect(buildDutySheet([duty('1', '2026-09-17', 'pm')])[0].jo).toBeNull();
  });

  it('한 근무일에 두 번이면 두 줄 다 노딱이다', () => {
    const rows = buildDutySheet([
      duty('1', '2026-09-17', 'am'),
      duty('2', '2026-09-17', 'dawn'),
      duty('3', '2026-09-19', 'pm'),
    ]);

    const yellow = rows.filter((row) => row.yellow).map((row) => row.duty.id);
    expect(yellow.sort()).toEqual(['1', '2']);
  });

  it('모르는 타임은 버린다', () => {
    const broken = { ...duty('x', '2026-09-18', 'am'), slot: 'constructor' };
    const rows = buildDutySheet([
      duty('1', '2026-09-17', 'pm'),
      broken as Duty,
      duty('2', '2026-09-18', 'am'),
    ]);

    expect(rows.map((row) => row.duty.id)).toEqual(['2', '1']);
    expect(rows[0].jo).toBe(4);
  });

  it('빈 목록은 빈 명세서다', () => {
    expect(buildDutySheet([])).toEqual([]);
  });
});

describe('groupDutiesByMonth', () => {
  it('달마다 자른다', () => {
    const months = groupDutiesByMonth(
      buildDutySheet([
        duty('1', '2026-09-30', 'pm'),
        duty('2', '2026-10-01', 'am'),
        duty('3', '2026-10-03', 'am'),
      ])
    );

    expect(months.map((month) => month.month)).toEqual(['2026-10', '2026-09']);
    expect(months[0].rows).toHaveLength(2);
  });
});

describe('tallyDuties', () => {
  it('타임별로 세고 노딱은 날 수로 센다', () => {
    const tally = tallyDuties(
      buildDutySheet([
        duty('1', '2026-09-17', 'am'),
        duty('2', '2026-09-17', 'dawn', true),
        duty('3', '2026-09-19', 'am'),
      ])
    );

    expect(tally.total).toBe(3);
    expect(tally.bySlot.am).toBe(2);
    expect(tally.bySlot.dawn).toBe(1);
    expect(tally.bySlot.pm).toBe(0);
    // 두 줄이 노딱이지만 날은 하루다.
    expect(tally.yellowDays).toBe(1);
    expect(tally.dayOffAfter).toBe(1);
  });
});

describe('타임 표기', () => {
  it('부대 근무표 그대로다', () => {
    expect(dutyTimeLabel('am')).toBe('08:00 — 12:15');
    expect(dutyTimeLabel('pm')).toBe('12:15 — 17:30');
    expect(dutyTimeLabel('evening')).toBe('17:30 — 22:00');
    expect(dutyTimeLabel('late')).toBe('22:00 — 03:00');
    expect(dutyTimeLabel('dawn')).toBe('03:00 — 08:00');
  });

  it('다섯 타임이 하루를 빈틈없이 잇는다', () => {
    const order: DutySlot[] = ['am', 'pm', 'evening', 'late', 'dawn'];
    const ends = order.map((slot) => dutyTimeLabel(slot).split(' — '));

    ends.forEach(([, to], index) => {
      expect(to).toBe(ends[(index + 1) % ends.length][0]);
    });
  });

  it('열삼과 삼팔만 자정을 넘긴다', () => {
    expect(crossesMidnight('late')).toBe(true);
    expect(crossesMidnight('dawn')).toBe(true);
    expect(crossesMidnight('evening')).toBe(false);
  });
});

describe('isDutySlot', () => {
  it('아는 타임만 통과시킨다', () => {
    expect(isDutySlot('am')).toBe(true);
    expect(isDutySlot('constructor')).toBe(false);
    expect(isDutySlot('night')).toBe(false);
  });
});
