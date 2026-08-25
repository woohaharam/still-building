import Link from 'next/link';
import { POST_TAGS, PostTag, TAG_LABELS, TAG_SLUGS } from '@/lib/types';

/**
 * 블로그 위쪽 카테고리 줄.
 *
 * 전에는 카테고리 목록·일기 안내·태그 필터가 따로 있었다. 셋 다 "무슨 글을
 * 볼지 고른다"는 같은 일이라 화면만 길어졌다. 하나로 합쳤다.
 *
 * 태그 필터와 달리 이건 실제 주소로 간다. 카테고리별로 페이지가 있어서
 * 링크를 공유할 수도 있고 검색에도 걸린다.
 */
export default function CategoryNav({
  active,
  counts,
}: {
  /** 지금 보고 있는 카테고리. 전체 목록이면 'all', 일기면 'diary'. */
  active: PostTag | 'all';
  counts?: Partial<Record<PostTag | 'all', number>>;
}) {
  const items: { key: PostTag | 'all'; label: string; href: string }[] = [
    { key: 'all', label: '전체', href: '/blog' },
    ...POST_TAGS.map((tag) => ({
      key: tag,
      label: TAG_LABELS[tag],
      href: `/blog/${TAG_SLUGS[tag]}`,
    })),
  ];

  return (
    <nav aria-label="카테고리" className="flex flex-wrap items-center gap-2">
      {items.map((item) => {
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

      {/* 일기는 잠겨 있어서 개수를 세지 않는다. 몇 편인지도 알려줄 이유가 없다. */}
      <Link
        href="/blog/diary"
        aria-current={active === 'diary' ? 'page' : undefined}
        className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
          active === 'diary'
            ? 'border-ink bg-ink text-paper'
            : 'border-dashed border-line text-ink-muted hover:border-ink-muted hover:text-ink-soft'
        }`}
      >
        일기
      </Link>
    </nav>
  );
}
