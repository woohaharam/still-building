import { describe, expect, it } from 'vitest';
import {
  bareUrl,
  externalLinks,
  militaryService,
  resumeActivities,
} from '@/lib/resume';
import { SERVICE } from '@/lib/service';
import { Activity, ActivityOutcome } from '@/lib/types';

describe('militaryService', () => {
  it('복무 중에는 복무 중으로 적는다', () => {
    expect(militaryService('2026-09-05').status).toBe('복무 중');
  });

  it('전역일 다음 날부터는 만기 전역으로 바뀐다', () => {
    expect(militaryService('2027-04-26').status).toBe('복무 중');
    expect(militaryService('2027-04-27').status).toBe('만기 전역');
    expect(militaryService('2028-01-01').status).toBe('만기 전역');
  });

  it('기간은 설정한 날짜를 달 단위로 그대로 쓴다', () => {
    expect(militaryService('2026-09-05').period).toBe('2025.07 — 2027.04');
    expect(SERVICE.enlistedOn).toBe('2025-07-28');
    expect(SERVICE.dischargeOn).toBe('2027-04-27');
  });
});

const activity = (
  id: string,
  outcome: ActivityOutcome,
  startedOn: string
): Activity => ({
  id,
  name: id,
  organizer: null,
  outcome,
  started_on: startedOn,
  ended_on: null,
  note: null,
  published: true,
  created_at: '2026-01-01T00:00:00Z',
});

describe('resumeActivities', () => {
  it('실제로 한 활동만 남긴다', () => {
    const picked = resumeActivities([
      activity('붙음', 'done', '2025-03-01'),
      activity('진행중', 'ongoing', '2025-04-01'),
      activity('대기', 'applied', '2025-05-01'),
      activity('떨어짐', 'rejected', '2025-06-01'),
    ]);

    expect(picked.map((a) => a.id)).toEqual(['진행중', '붙음']);
  });

  it('남길 게 없으면 빈 배열이다', () => {
    expect(
      resumeActivities([activity('떨어짐', 'rejected', '2025-06-01')])
    ).toHaveLength(0);
  });
});

describe('bareUrl', () => {
  it('프로토콜과 끝 슬래시를 뗀다', () => {
    expect(bareUrl('https://github.com/woohaharam')).toBe(
      'github.com/woohaharam'
    );
    expect(bareUrl('http://example.com/')).toBe('example.com');
  });

  it('이미 주소만 있으면 그대로 둔다', () => {
    expect(bareUrl('example.com/a')).toBe('example.com/a');
  });
});

describe('externalLinks', () => {
  it('사이트 안쪽 주소는 뺀다', () => {
    const links = externalLinks([
      { label: '저장소', href: 'https://github.com/a/b' },
      { label: '블로그 글', href: '/blog' },
    ]);

    expect(links.map((l) => l.label)).toEqual(['저장소']);
  });
});
