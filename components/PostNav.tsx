import Link from 'next/link';
import { Post } from '@/lib/types';

/** 글 아래에 붙는 이전/다음 글. 둘 다 없으면 아무것도 안 그린다. */
export default function PostNav({
  older,
  newer,
}: {
  older: Post | null;
  newer: Post | null;
}) {
  if (!older && !newer) return null;

  return (
    <nav className="mt-16 grid gap-3 border-t border-line pt-8 sm:grid-cols-2">
      {older ? (
        <NavLink post={older} label="이전 글" align="left" />
      ) : (
        <span className="hidden sm:block" />
      )}
      {newer && <NavLink post={newer} label="다음 글" align="right" />}
    </nav>
  );
}

function NavLink({
  post,
  label,
  align,
}: {
  post: Post;
  label: string;
  align: 'left' | 'right';
}) {
  return (
    <Link
      href={`/posts/${encodeURIComponent(post.slug)}`}
      className={`group flex flex-col gap-1 rounded-md border border-line p-4 transition-colors hover:border-ink-muted ${
        align === 'right' ? 'sm:text-right' : ''
      }`}
    >
      <span className="text-xs text-ink-muted">
        {align === 'right' ? `${label} →` : `← ${label}`}
      </span>
      <span className="text-sm font-medium leading-snug transition-colors group-hover:text-accent">
        {post.title}
      </span>
    </Link>
  );
}
