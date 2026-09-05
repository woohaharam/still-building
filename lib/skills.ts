import { PROJECTS, Project } from './projects';

/**
 * 스택 이름에서 버전과 괄호 설명을 떼어낸 이름.
 *
 * 프로젝트마다 같은 기술을 다르게 적어뒀다. 'Next.js 14 (App Router)' 와
 * 'Next.js 15' 는 사람 눈에는 같은 것이지만 문자열로는 다르다. 목록에
 * 'Next.js' 가 두 줄로 나오지 않게 여기서 하나로 모은다.
 *
 * 'NextAuth.js' 처럼 이름 안에 점이 있는 건 건드리지 않는다. 숫자를 떼는 건
 * 공백 뒤에 버전만 남았을 때뿐이다.
 */
export function skillKey(raw: string): string {
  return raw
    .replace(/\s*\([^)]*\)/g, '')
    .replace(/\s+v?\d+(\.\d+)*$/, '')
    .trim();
}

export interface SkillUse {
  /** 화면에 쓰는 이름. 버전이 빠진 쪽. */
  name: string;
  /** 이 기술을 쓴 프로젝트. 최근 것부터. */
  projects: { slug: string; title: string }[];
}

/**
 * 프로젝트 스택을 뒤집어 '기술 → 쓴 프로젝트' 로 만든다.
 *
 * 기술을 손으로 나열하면 프로젝트가 늘어날 때마다 따로 고쳐야 하고, 언젠가
 * 실제로 쓴 적 없는 이름이 목록에만 남는다. 이력서에서 그건 근거 없는 주장이
 * 된다. 그래서 목록을 쓰지 않고 프로젝트에서 뽑는다.
 *
 * 많이 쓴 것부터, 같으면 이름순. 정렬 기준이 하나뿐이면 순서가 흔들린다.
 */
export function skillsFromProjects(projects: Project[] = PROJECTS): SkillUse[] {
  const byName = new Map<string, SkillUse>();
  // 그 기술이 처음 나온 프로젝트의 자리. 정렬에서 '최근에 썼는가'로 쓴다.
  const firstSeen = new Map<string, number>();

  projects.forEach((project, order) => {
    for (const raw of project.stack) {
      const name = skillKey(raw);
      if (!name) continue;

      const found = byName.get(name);
      const entry = found ?? { name, projects: [] };
      if (!found) {
        byName.set(name, entry);
        firstSeen.set(name, order);
      }

      // 한 프로젝트가 같은 기술을 두 가지 표기로 적어둔 경우를 막는다.
      if (!entry.projects.some((p) => p.slug === project.slug)) {
        entry.projects.push({ slug: project.slug, title: project.title });
      }
    }
  });

  /*
    많이 쓴 것 → 최근에 쓴 것 → 이름순.

    개수만으로 줄을 세우면 한 번씩 쓴 기술들이 이름순으로 섞여서, 2024년에
    한 번 쓰고 만 것이 지금 쓰는 것보다 위로 올라온다. PROJECTS 가 최근 순
    이므로 처음 나온 자리를 그대로 두 번째 기준으로 쓴다.
  */
  return [...byName.values()].sort(
    (a, b) =>
      b.projects.length - a.projects.length ||
      firstSeen.get(a.name)! - firstSeen.get(b.name)! ||
      a.name.localeCompare(b.name)
  );
}
