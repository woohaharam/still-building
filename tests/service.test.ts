import { describe, expect, it } from 'vitest';
import {
  RETURN_TIMES,
  SERVICE,
  dDayLabel,
  hasReturned,
  parseClock,
  serviceStanding,
  serviceStatus,
} from '@/lib/service';
import { LEAVE_KINDS, LeaveKind } from '@/lib/types';

const IN = SERVICE.enlistedOn;
const OUT = SERVICE.dischargeOn;

describe('serviceStatus', () => {
  it('군돌이 화면과 같은 값을 낸다', () => {
    // 2026-09-03 기준 D-236, 63.1% 로 찍혀 있었다.
    const s = serviceStatus('2026-09-03');
    expect(s.daysLeft).toBe(236);
    expect(s.totalDays).toBe(639);
    expect(s.servedDays).toBe(403);
    expect(Math.round(s.percent * 10) / 10).toBe(63.1);
  });

  it('입대 당일은 하루를 지낸 것으로 센다', () => {
    const s = serviceStatus(IN);
    expect(s.servedDays).toBe(1);
    expect(s.discharged).toBe(false);
  });

  it('전역일에는 100%이고 남은 날이 0이다', () => {
    const s = serviceStatus(OUT);
    expect(s.percent).toBe(100);
    expect(s.daysLeft).toBe(0);
    expect(s.discharged).toBe(true);
  });

  it('입대 전에는 0%이고 음수가 나오지 않는다', () => {
    const s = serviceStatus('2025-01-01');
    expect(s.servedDays).toBe(0);
    expect(s.percent).toBe(0);
    expect(s.daysLeft).toBeGreaterThan(0);
  });

  it('전역이 지나도 100%를 넘지 않는다', () => {
    const s = serviceStatus('2030-01-01');
    expect(s.percent).toBe(100);
    expect(s.servedDays).toBe(s.totalDays);
    expect(s.daysLeft).toBe(0);
    expect(s.discharged).toBe(true);
  });

  it('전역일이 입대일보다 빨라도 화면이 깨지지 않는다', () => {
    // 설정을 잘못 적었을 때 음수 막대를 그리느니 최소값으로 버틴다.
    const s = serviceStatus('2026-01-01', '2026-05-01', '2025-05-01');
    expect(s.totalDays).toBeGreaterThan(0);
    expect(s.percent).toBeGreaterThanOrEqual(0);
    expect(s.percent).toBeLessThanOrEqual(100);
    expect(s.daysLeft).toBeGreaterThanOrEqual(0);
  });

  it('진행률은 항상 0과 100 사이다', () => {
    for (const day of ['2025-01-01', IN, '2026-09-03', OUT, '2099-12-31']) {
      const s = serviceStatus(day);
      expect(s.percent).toBeGreaterThanOrEqual(0);
      expect(s.percent).toBeLessThanOrEqual(100);
    }
  });
});

describe('dDayLabel', () => {
  it('남은 날을 D- 꼴로 보여준다', () => {
    expect(dDayLabel(serviceStatus('2026-09-03'))).toBe('D-236');
  });

  it('전역일 당일은 D-DAY', () => {
    expect(dDayLabel(serviceStatus(OUT))).toBe('D-DAY');
  });

  it('전역일이 지나면 전역', () => {
    expect(dDayLabel(serviceStatus('2030-01-01'))).toBe('전역');
  });
});

describe('serviceStanding', () => {
  it('전역하면 이모지가 붙고 강조된다', () => {
    const standing = serviceStanding(serviceStatus(OUT));

    expect(standing.label).toBe('전역');
    expect(standing.emoji).not.toBe('');
    expect(standing.strong).toBe(true);
  });

  it('전역일 당일부터 전역이다', () => {
    expect(serviceStanding(serviceStatus('2027-04-26')).label).toBe('복무 중');
    expect(serviceStanding(serviceStatus('2027-04-27')).label).toBe('전역');
  });

  it('입대 전에는 입대 전이라고 적는다', () => {
    expect(serviceStanding(serviceStatus('2025-07-27')).label).toBe('입대 전');
  });

  it('나가 있으면 종류에 맞는 말로 바뀐다', () => {
    const serving = serviceStatus(IN);

    expect(serviceStanding(serving, 'outing').label).toBe('외출 중');
    expect(serviceStanding(serving, 'special_outing').label).toBe('외출 중');
    expect(serviceStanding(serving, 'overnight').label).toBe('외박 중');
    expect(serviceStanding(serving, 'leave').label).toBe('휴가 중');
    expect(serviceStanding(serving, 'final').label).toBe('말출');
    expect(serviceStanding(serving, 'off').label).toBe('OFF');
  });

  it('나가 있어도 강조하지는 않는다. 강조는 전역만이다', () => {
    expect(serviceStanding(serviceStatus(IN), 'leave').strong).toBe(false);
    expect(serviceStanding(serviceStatus(IN), 'leave').emoji).toBe('');
  });

  it('전역이 나가 있는 것보다 앞선다', () => {
    expect(serviceStanding(serviceStatus(OUT), 'leave').label).toBe('전역');
  });

  it('모르는 종류가 와도 프로토타입 값이 새어 나오지 않는다', () => {
    const odd = 'constructor' as unknown as LeaveKind;

    expect(serviceStanding(serviceStatus(IN), odd).label).toBe('복무 중');
  });

  it('LEAVE_KINDS 에 있는 종류는 빠짐없이 말이 있다', () => {
    const serving = serviceStatus(IN);

    for (const kind of LEAVE_KINDS) {
      expect(serviceStanding(serving, kind).label).not.toBe('복무 중');
    }
  });
});

describe('parseClock', () => {
  it('시각을 자정에서 몇 분인지로 바꾼다', () => {
    expect(parseClock('00:00')).toBe(0);
    expect(parseClock('20:30')).toBe(1230);
    expect(parseClock('23:59')).toBe(1439);
  });

  it('모양이나 범위가 어긋나면 null', () => {
    expect(parseClock('24:00')).toBeNull();
    expect(parseClock('20:60')).toBeNull();
    expect(parseClock('2030')).toBeNull();
    expect(parseClock('')).toBeNull();
  });
});

describe('hasReturned', () => {
  it('복귀 시각이 지나면 참', () => {
    expect(hasReturned('outing', 1229)).toBe(false);
    expect(hasReturned('outing', 1230)).toBe(true);
  });

  it('복귀 시각이 없는 종류는 언제나 거짓', () => {
    expect(hasReturned('final', 1439)).toBe(false);
    expect(hasReturned('off', 1439)).toBe(false);
  });

  it('모르는 종류가 와도 프로토타입 값이 새어 나오지 않는다', () => {
    const odd = 'constructor' as unknown as LeaveKind;

    expect(hasReturned(odd, 1439)).toBe(false);
  });

  it('RETURN_TIMES 의 값은 전부 읽을 수 있는 시각이거나 null 이다', () => {
    for (const kind of LEAVE_KINDS) {
      const clock = RETURN_TIMES[kind];
      if (clock !== null) expect(parseClock(clock)).not.toBeNull();
    }
  });
});
