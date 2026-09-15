import { projectTech } from './skills';
import { TECH_ICONS } from './tech-icons';

/**
 * 기술을 화면에 늘어놓는 방식.
 *
 * 무엇을 다룰 줄 아는지를 보여주는 자리다. 어디에 썼는지는 프로젝트 쪽에 이미
 * 있어서 여기서 또 적으면 같은 말이 두 번 나온다.
 *
 * 목록 자체는 여전히 프로젝트에서 뽑는다 (lib/skills.ts). 손으로 나열하면
 * 언젠가 실제로 쓴 적 없는 이름이 목록에만 남고, 이력서에서 그건 근거 없는
 * 주장이 된다. 여기 표는 '어느 칸에 어느 로고로 놓을지'만 정한다.
 */

export type TechGroupKey = 'language' | 'framework' | 'data' | 'ops';

export const TECH_GROUP_LABELS: Record<TechGroupKey, string> = {
  language: '언어',
  framework: '프레임워크 · UI',
  data: '데이터 · 인증',
  ops: '배포 · 품질',
};

/** 화면에 놓는 칸 순서. */
const GROUP_ORDER: TechGroupKey[] = ['language', 'framework', 'data', 'ops'];

/**
 * 기술 이름 → 어느 칸에 어느 로고로.
 *
 * 열쇠는 lib/skills.ts 의 skillKey 를 거친 이름이다. 'Next.js 16 (App Router)'
 * 은 여기 오기 전에 'Next.js' 가 되어 있다.
 *
 * icon 이 null 인 건 simple-icons 에 마크가 없는 것이다. 글자로 대신 그리고,
 * letter 로 어느 글자인지 고를 수 있다.
 * 칸 안의 순서는 적은 순서 그대로다 — HTML 부터 TypeScript 까지처럼, 배운
 * 순서가 읽기에 자연스러운 자리가 있다.
 */
const TECH: Record<
  string,
  { group: TechGroupKey; icon: string | null; letter?: string }
> = {
  HTML: { group: 'language', icon: 'html5' },
  CSS: { group: 'language', icon: 'css' },
  JavaScript: { group: 'language', icon: 'javascript' },
  TypeScript: { group: 'language', icon: 'typescript' },

  'Next.js': { group: 'framework', icon: 'nextdotjs' },
  'Tailwind CSS': { group: 'framework', icon: 'tailwindcss' },

  Supabase: { group: 'data', icon: 'supabase' },
  'React Query': { group: 'data', icon: 'reactquery' },
  /*
    NextAuth.js 만 마크가 없다. 이름 첫 글자를 그대로 쓰면 'N' 인데, 바로 위
    칸의 Next.js 로고도 동그라미 안의 N 이라 작게 보면 구분이 안 된다.
  */
  'NextAuth.js': { group: 'data', icon: null, letter: 'A' },

  Vercel: { group: 'ops', icon: 'vercel' },
  'GitHub Actions': { group: 'ops', icon: 'githubactions' },
  Vitest: { group: 'ops', icon: 'vitest' },
};

export interface Tech {
  name: string;
  /** 없으면 letter 를 대신 그린다. */
  icon: (typeof TECH_ICONS)[string] | null;
  /** 로고 자리에 넣을 글자. 로고가 있으면 쓰지 않는다. */
  letter: string;
}

export interface TechGroup {
  key: TechGroupKey;
  label: string;
  items: Tech[];
}

/**
 * 프로젝트에서 뽑은 기술을 칸별로 묶는다.
 *
 * 표에 없는 이름은 버리지 않고 마지막 칸에 붙인다. 프로젝트에 기술을 하나
 * 더 적었을 때 화면에서 조용히 사라지는 게 제일 나쁘다 — 빠진 걸 알아채려면
 * 두 파일을 나란히 놓고 봐야 한다.
 *
 * 이름을 직접 넘길 수도 있다. 테스트에서 PROJECTS 를 끌고 오지 않으려고 둔
 * 자리다 (lib/skills.ts 의 projectTech 와 같은 방식).
 */
export function techGroups(names: string[] = projectTech()): TechGroup[] {
  const buckets = new Map<TechGroupKey, Tech[]>(
    GROUP_ORDER.map((key) => [key, []])
  );

  const wanted = new Set(names);

  // 표에 적은 순서대로 담는다. 프로젝트에서 나온 것만.
  for (const [name, { group, icon, letter }] of Object.entries(TECH)) {
    if (!wanted.has(name)) continue;
    buckets.get(group)!.push({
      name,
      icon: icon === null ? null : (TECH_ICONS[icon] ?? null),
      letter: letter ?? name.slice(0, 1),
    });
  }

  for (const name of names) {
    if (Object.prototype.hasOwnProperty.call(TECH, name)) continue;
    buckets.get('ops')!.push({ name, icon: null, letter: name.slice(0, 1) });
  }

  return GROUP_ORDER.map((key) => ({
    key,
    label: TECH_GROUP_LABELS[key],
    items: buckets.get(key)!,
  })).filter((group) => group.items.length > 0);
}
