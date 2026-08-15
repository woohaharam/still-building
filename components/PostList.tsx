'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Post, PostTag, TAG_LABELS } from '@/lib/types';
import TagFilter from './TagFilter';

function formatDate(dateStr: string | null) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
}

export default function PostList({ posts }: { posts: Post[] }) {
  const [activeTag, setActiveTag] = useState<PostTag | 'all'>('all');

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: posts.length, tech: 0, life: 0, retrospective: 0 };
    posts.forEach((p) => p.tags?.forEach((t) => (c[t] = (c[t] || 0) + 1)));
    return c;
  }, [posts]);

  const filtered = useMemo(() => {
    if (activeTag === 'all') return posts;
    return posts.filter((p) => p.tags?.includes(activeTag));
  }, [posts, activeTag]);

  return (
    <div className="flex flex-col gap-8">
      <TagFilter active={activeTag} onChange={setActiveTag} counts={counts} />

      {filtered.length === 0 && (
        <p className="text-ink-muted text-sm py-12 text-center">
          {posts.length === 0
            ? '아직 작성된 글이 없어요. 첫 글을 기다리고 있어요.'
            : '이 태그에 해당하는 글이 아직 없어요.'}
        </p>
      )}

      <ul className="flex flex-col">
        {filtered.map((post) => (
          <li key={post.id} className="border-b border-line py-6 first:pt-0">
            <Link href={`/posts/${post.slug}`} className="group block">
              <h2 className="text-lg font-semibold group-hover:text-accent transition-colors">
                {post.title}
              </h2>
              {post.excerpt && (
                <p className="mt-2 text-ink-soft text-sm leading-relaxed">
                  {post.excerpt}
                </p>
              )}
              <div className="mt-3 flex items-center gap-3 text-xs text-ink-muted">
                <span>{formatDate(post.published_at)}</span>
                {post.tags?.map((t) => (
                  <span key={t}>#{TAG_LABELS[t]}</span>
                ))}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
