import { describe, expect, it } from 'vitest';
import { projectTech, skillKey } from '@/lib/skills';
import { PROJECTS, Project } from '@/lib/projects';

describe('skillKey', () => {
  it('버전 번호를 뗀다', () => {
    expect(skillKey('Next.js 15')).toBe('Next.js');
    expect(skillKey('Vue 3.4')).toBe('Vue');
  });

  it('괄호 설명을 뗀다', () => {
    expect(skillKey('Supabase (Postgres · Auth · Storage)')).toBe('Supabase');
  });

  it('버전과 괄호가 같이 붙어도 이름만 남긴다', () => {
    expect(skillKey('Next.js 14 (App Router)')).toBe('Next.js');
  });

  it('이름 안의 점은 버전이 아니다', () => {
    expect(skillKey('NextAuth.js')).toBe('NextAuth.js');
    expect(skillKey('Next.js')).toBe('Next.js');
  });

  it('버전이 아닌 뒷말은 남긴다', () => {
    expect(skillKey('Tailwind CSS')).toBe('Tailwind CSS');
    expect(skillKey('React Query')).toBe('React Query');
    expect(skillKey('GitHub Actions')).toBe('GitHub Actions');
  });
});

const project = (slug: string, stack: string[]): Project => ({
  slug,
  title: slug.toUpperCase(),
  period: '2026.01',
  role: '개인',
  summary: '',
  stack,
  links: [],
});

describe('projectTech', () => {
  it('표기가 달라도 같은 기술이면 한 번만 나온다', () => {
    const tech = projectTech([
      project('a', ['Next.js 14 (App Router)']),
      project('b', ['Next.js 15']),
    ]);

    expect(tech).toEqual(['Next.js']);
  });

  it('한 프로젝트가 같은 기술을 두 표기로 적어도 한 번만 나온다', () => {
    const tech = projectTech([project('a', ['Next.js 14', 'Next.js'])]);
    expect(tech).toEqual(['Next.js']);
  });

  it('처음 나온 순서를 지킨다', () => {
    const tech = projectTech([
      project('a', ['TypeScript', 'Vercel']),
      project('b', ['Vercel', 'Vitest']),
    ]);

    expect(tech).toEqual(['TypeScript', 'Vercel', 'Vitest']);
  });

  it('빈 이름은 버린다', () => {
    expect(projectTech([project('a', ['', '   ', 'Zod'])])).toEqual(['Zod']);
  });

  it('실제 프로젝트에서 뽑으면 비어 있지 않다', () => {
    const tech = projectTech(PROJECTS);

    expect(tech.length).toBeGreaterThan(0);
    // 버전이 붙은 채로 새어 나오는 이름이 없어야 한다.
    for (const name of tech) expect(name).toBe(skillKey(name));
  });
});
