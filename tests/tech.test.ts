import { describe, expect, it } from 'vitest';
import { projectTech } from '@/lib/skills';
import { TECH_GROUP_LABELS, techGroups } from '@/lib/tech';
import { TECH_ICONS } from '@/lib/tech-icons';

/** 칸을 가로질러 이름만 뽑는다. */
function names(groups: ReturnType<typeof techGroups>) {
  return groups.flatMap((group) => group.items.map((item) => item.name));
}

describe('techGroups', () => {
  it('넘긴 이름을 하나도 빠뜨리지 않는다', () => {
    const given = ['TypeScript', 'Vercel', 'Supabase'];
    expect(names(techGroups(given)).sort()).toEqual([...given].sort());
  });

  it('표에 없는 이름도 버리지 않는다', () => {
    const groups = techGroups(['TypeScript', '처음 보는 것']);
    expect(names(groups)).toContain('처음 보는 것');
  });

  it('표에 없는 이름은 로고 없이 첫 글자로 온다', () => {
    const odd = techGroups(['처음 보는 것'])
      .flatMap((group) => group.items)
      .find((item) => item.name === '처음 보는 것');

    expect(odd?.icon).toBeNull();
    expect(odd?.letter).toBe('처');
  });

  it('로고 없는 기술은 이름 첫 글자와 다른 글자를 쓸 수 있다', () => {
    // Next.js 로고와 헷갈리지 않게 'N' 이 아니라 'A' 다.
    const auth = techGroups(['NextAuth.js'])
      .flatMap((group) => group.items)
      .find((item) => item.name === 'NextAuth.js');

    expect(auth?.icon).toBeNull();
    expect(auth?.letter).toBe('A');
  });

  it('빈 칸은 내지 않는다', () => {
    const groups = techGroups(['TypeScript']);
    expect(groups).toHaveLength(1);
    expect(groups[0].label).toBe(TECH_GROUP_LABELS.language);
  });

  it('칸 순서는 언어부터다', () => {
    const groups = techGroups(['Vercel', 'TypeScript', 'Supabase']);
    expect(groups.map((group) => group.key)).toEqual(
      ['language', 'framework', 'data', 'ops'].filter((key) =>
        groups.some((group) => group.key === key)
      )
    );
  });

  it('아무것도 안 넘기면 프로젝트에서 뽑는다', () => {
    expect(names(techGroups()).sort()).toEqual([...projectTech()].sort());
  });

  it('실제 프로젝트의 기술은 전부 제자리가 있다', () => {
    // 표에 빠진 이름은 '배포 · 품질' 로 떨어진다. 언어가 거기 있으면 표를 고쳐야 한다.
    const ops = techGroups().find((group) => group.key === 'ops');
    expect(ops?.items.map((item) => item.name)).toEqual([
      'Vercel',
      'GitHub Actions',
      'Vitest',
    ]);
  });
});

describe('TECH_ICONS', () => {
  it('모든 로고가 두 테마의 색을 같이 갖거나 둘 다 비운다', () => {
    for (const [slug, icon] of Object.entries(TECH_ICONS)) {
      expect(icon.path.length, slug).toBeGreaterThan(0);
      expect(icon.light === null, slug).toBe(icon.dark === null);
    }
  });

  it('색이 있으면 여섯 자리 hex 다', () => {
    for (const [slug, icon] of Object.entries(TECH_ICONS)) {
      if (icon.light === null) continue;
      expect(icon.light, slug).toMatch(/^#[0-9a-f]{6}$/);
      expect(icon.dark, slug).toMatch(/^#[0-9a-f]{6}$/);
    }
  });
});
