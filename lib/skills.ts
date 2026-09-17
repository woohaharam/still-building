import { PROJECTS, Project } from './projects';

/**
 * 스택 이름에서 버전과 괄호 설명을 떼어낸 이름.
 *
 * 프로젝트마다 같은 기술을 다르게 적어뒀다. 'Next.js 16 (App Router)' 와
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

/**
 * 프로젝트 스택에 실제로 적힌 기술 이름. 처음 나온 순서대로, 중복 없이.
 *
 * 기술을 손으로 나열하면 프로젝트가 늘어날 때마다 따로 고쳐야 하고, 언젠가
 * 실제로 쓴 적 없는 이름이 목록에만 남는다. 이력서에서 그건 근거 없는 주장이
 * 된다. 그래서 목록을 쓰지 않고 프로젝트에서 뽑는다.
 *
 * 화면에 어떻게 늘어놓을지는 여기서 정하지 않는다 (lib/tech.ts). 한동안
 * 기술마다 '쓴 프로젝트'를 같이 들고 다녔는데, 그걸 화면에서 걷어낸 뒤로는
 * 아무도 읽지 않는 값을 세고 정렬하는 일만 남아 있었다.
 */
export function projectTech(projects: Project[] = PROJECTS): string[] {
  const names = new Set<string>();

  for (const project of projects) {
    for (const raw of project.stack) {
      const name = skillKey(raw);
      if (name) names.add(name);
    }
  }

  return [...names];
}
