'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import remarkGfm from 'remark-gfm';
import { openDiary } from '@/lib/diary';
import { markdownComponents } from '@/lib/markdown';
import { formatDate } from '@/lib/date';
import { readingMinutes } from '@/lib/reading';
import { Post } from '@/lib/types';
import PostRow from './PostRow';

export default function DiaryGate() {
  const [password, setPassword] = useState('');
  const [posts, setPosts] = useState<Post[] | null>(null);
  const [openSlug, setOpenSlug] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [checking, setChecking] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!password.trim()) return;

    setChecking(true);
    setError('');
    try {
      setPosts(await openDiary(password));
    } catch (err) {
      setError(err instanceof Error ? err.message : '열지 못했어요.');
    } finally {
      setChecking(false);
      setPassword('');
    }
  }

  if (posts) {
    if (posts.length === 0) {
      return (
        <p className="py-12 text-center text-sm text-ink-muted">
          아직 쓴 일기가 없어요.
        </p>
      );
    }

    const open = posts.find((post) => post.slug === openSlug);

    if (open) {
      return (
        <article>
          <button
            onClick={() => setOpenSlug(null)}
            className="group inline-flex items-center gap-2 text-sm text-ink-muted transition-colors hover:text-ink-soft"
          >
            <span className="transition-transform group-hover:-translate-x-0.5">
              ←
            </span>
            일기 목록
          </button>

          <header className="mb-10 mt-6">
            <h2 className="text-2xl font-bold leading-snug">{open.title}</h2>
            <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-ink-muted">
              <span>{formatDate(open.published_at)}</span>
              <span>읽는 데 {readingMinutes(open.content)}분</span>
            </div>
          </header>

          <div className="prose-post">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[[rehypeHighlight, { ignoreMissing: true }]]}
              components={markdownComponents}
            >
              {open.content}
            </ReactMarkdown>
          </div>
        </article>
      );
    }

    return (
      <ul className="flex flex-col">
        {posts.map((post) => (
          <li key={post.id} className="border-b border-line py-6 first:pt-0">
            <button
              onClick={() => setOpenSlug(post.slug)}
              className="group flex w-full items-start gap-4 text-left"
            >
              <PostRow post={post} showTags={false} />
            </button>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-sm">
      <label htmlFor="diary-password" className="block text-sm text-ink-soft">
        비밀번호
      </label>
      <div className="mt-2 flex gap-2">
        <input
          id="diary-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="off"
          className="min-w-0 flex-1 rounded-md border border-line bg-transparent px-3 py-2 text-sm focus:border-ink-muted focus:outline-none"
        />
        <button
          type="submit"
          disabled={checking || !password.trim()}
          className="shrink-0 rounded-md bg-ink px-4 py-2 text-sm font-medium text-paper disabled:opacity-50"
        >
          {checking ? '확인 중...' : '열기'}
        </button>
      </div>
      {error && <p className="mt-3 text-sm text-danger">{error}</p>}
    </form>
  );
}
