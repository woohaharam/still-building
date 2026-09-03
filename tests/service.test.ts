import { describe, expect, it } from 'vitest';
import { SERVICE, dDayLabel, serviceStatus } from '@/lib/service';

const IN = SERVICE.enlistedOn;
const OUT = SERVICE.dischargeOn;

describe('serviceStatus', () => {
  it('군돌이 화면과 같은 값을 낸다', () => {
    // 2026-09-03 기준 D-236, 63.1% 로 찍혀 있었다.
    const s = serviceStatus('2026-09-03');
    expect(s.daysLeft).toBe(236);
    expect(s.totalDays).toBe(640);
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
