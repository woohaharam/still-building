import { describe, expect, it } from 'vitest';
import { skillKey, skillsFromProjects } from '@/lib/skills';
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

describe('skillsFromProjects', () => {
  it('표기가 달라도 같은 기술이면 한 줄로 모은다', () => {
    const skills = skillsFromProjects([
      project('a', ['Next.js 14 (App Router)']),
      project('b', ['Next.js 15']),
    ]);

    expect(skills).toHaveLength(1);
    expect(skills[0].name).toBe('Next.js');
    expect(skills[0].projects.map((p) => p.slug)).toEqual(['a', 'b']);
  });

  it('한 프로젝트가 같은 기술을 두 번 적어도 한 번만 센다', () => {
    const skills = skillsFromProjects([
      project('a', ['Next.js 14 (App Router)', 'Next.js']),
    ]);

    expect(skills[0].projects).toHaveLength(1);
  });

  it('많이 쓴 것부터, 같으면 최근에 쓴 것부터', () => {
    const skills = skillsFromProjects([
      project('최근', ['TypeScript', 'Zod']),
      project('예전', ['TypeScript', 'Astro']),
    ]);

    expect(skills.map((s) => s.name)).toEqual(['TypeScript', 'Zod', 'Astro']);
  });

  it('개수도 시기도 같으면 이름순으로 고정한다', () => {
    const skills = skillsFromProjects([project('하나', ['Zod', 'Astro'])]);

    expect(skills.map((s) => s.name)).toEqual(['Astro', 'Zod']);
  });

  it('실제 프로젝트 데이터에서 빈 이름이 나오지 않는다', () => {
    const skills = skillsFromProjects(PROJECTS);

    expect(skills.length).toBeGreaterThan(0);
    for (const skill of skills) {
      expect(skill.name).not.toBe('');
      expect(skill.projects.length).toBeGreaterThan(0);
    }
  });
});
