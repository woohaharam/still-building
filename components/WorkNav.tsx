import Link from 'next/link';

/**
 * 프로젝트 · 논문 · 활동 사이를 오가는 줄.
 *
 * 셋은 성격이 달라서 한 페이지에 쌓으면 서로 묻힌다. 그렇다고 헤더에 셋을
 * 다 올리면 메뉴가 여덟 개가 되어 좁은 화면에서 두 줄로 접힌다.
 *
 * 그래서 블로그 카테고리와 같은 방식을 썼다. 헤더에는 '프로젝트' 하나만
 * 두고, 세 페이지 위에 이 줄을 얹어 서로 건너가게 한다.
 */
const ITEMS = [
  { key: 'projects', label: '프로젝트', href: '/projects' },
  { key: 'papers', label: '논문', href: '/papers' },
  { key: 'activities', label: '활동', href: '/activities' },
] as const;

export type WorkSection = (typeof ITEMS)[number]['key'];

export default function WorkNav({
  active,
  counts,
}: {
  active: WorkSection;
  counts?: Partial<Record<WorkSection, number>>;
}) {
  return (
    <nav aria-label="분류" className="flex flex-wrap items-center gap-2">
      {ITEMS.map((item) => {
        const on = item.key === active;
        return (
          <Link
            key={item.key}
            href={item.href}
            aria-current={on ? 'page' : undefined}
            className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
              on
                ? 'border-ink bg-ink text-paper'
                : 'border-line text-ink-soft hover:border-ink-muted hover:text-ink'
            }`}
          >
            {item.label}
            {counts?.[item.key] !== undefined && (
              <span className="ml-1.5 opacity-60">{counts[item.key]}</span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
