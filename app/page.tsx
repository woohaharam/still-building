import type { Metadata } from 'next';
import Link from 'next/link';
import ProjectCard from '@/components/ProjectCard';
import { getPublishedPosts } from '@/lib/posts';
import { readingMinutes } from '@/lib/reading';
import {
  siteAuthor,
  siteAuthorAlias,
  siteEmail,
  siteGithub,
  siteUrl,
} from '@/lib/site';
import { Post } from '@/lib/types';

export const revalidate = 0;

export const metadata: Metadata = {
  description: `${siteAuthor}(${siteAuthorAlias}) — 필요한 걸 직접 만들고, 만들면서 배운 걸 기록합니다.`,
  alternates: { canonical: siteUrl },
};

/**
 * 소개와 만든 것들은 데이터베이스와 상관이 없어요.
 * 글을 못 불러와도 그 부분까지 에러 화면으로 덮이면 곤란하니, 여기서만 따로 받아둡니다.
 */
async function loadRecentPosts(): Promise<{ posts: Post[]; failed: boolean }> {
  try {
    const posts = await getPublishedPosts();
    return { posts: posts.slice(0, 3), failed: false };
  } catch {
    return { posts: [], failed: true };
  }
}

function formatDate(value: string | null) {
  if (!value) return '';
  const d = new Date(value);
  return `${d.getFullYear()}. ${d.getMonth() + 1}. ${d.getDate()}.`;
}

export default async function HomePage() {
  const { posts, failed } = await loadRecentPosts();

  return (
    <div className="flex flex-col gap-20">
      <section>
        <p className="text-sm text-ink-muted">{siteAuthorAlias}</p>
        <h1 className="mt-2 text-3xl font-bold leading-tight">{siteAuthor}</h1>
        <p className="mt-5 leading-relaxed text-ink-soft">
          필요한 걸 직접 만들고, 만들면서 배운 것과 그 사이의 생각을 기록합니다.
          지금은 이 블로그를 만들면서 웹을 배우고 있어요.
        </p>

        <div className="mt-7 flex flex-wrap gap-3">
          <Link
            href="/blog"
            className="rounded-md bg-ink px-4 py-2.5 text-sm font-medium text-paper transition-opacity hover:opacity-90"
          >
            블로그 보기
          </Link>
          <a
            href={siteGithub}
            target="_blank"
            rel="noreferrer"
            className="rounded-md border border-line px-4 py-2.5 text-sm font-medium text-ink-soft transition-colors hover:border-ink-muted hover:text-ink"
          >
            GitHub
          </a>
        </div>
      </section>

      <section>
        <h2 className="mb-6 text-lg font-semibold">만든 것들</h2>
        <div className="flex flex-col gap-4">
          <ProjectCard
            title="STILL BUILDING"
            description="지금 보고 계신 블로그. 글쓰기와 일정을 한 곳에서 관리하려고 직접 만들었어요. 달력, 검색, 다크 모드, 링크 미리보기 카드까지 붙어 있고, 글은 관리자 페이지에서 마크다운으로 씁니다."
            stack="Next.js 14 · TypeScript · Tailwind · Supabase · Vercel"
            link={`${siteGithub}/still-building`}
          />
        </div>
      </section>

      <section>
        <div className="mb-6 flex items-baseline justify-between">
          <h2 className="text-lg font-semibold">최근 글</h2>
          <Link
            href="/blog"
            className="text-sm text-ink-muted transition-colors hover:text-ink"
          >
            전체 보기 →
          </Link>
        </div>

        {failed ? (
          <p className="text-sm text-ink-muted">
            글 목록을 불러오지 못했어요.{' '}
            <Link href="/blog" className="underline underline-offset-4">
              블로그에서 다시 시도
            </Link>
          </p>
        ) : posts.length === 0 ? (
          <p className="text-sm text-ink-muted">아직 쓴 글이 없어요.</p>
        ) : (
          <ul className="flex flex-col">
            {posts.map((post) => (
              <li key={post.id} className="border-b border-line py-5 first:pt-0">
                <Link
                  href={`/posts/${encodeURIComponent(post.slug)}`}
                  className="group block"
                >
                  <h3 className="font-medium transition-colors group-hover:text-accent">
                    {post.title}
                  </h3>
                  <div className="mt-2 flex items-center gap-3 text-xs text-ink-muted">
                    <span>{formatDate(post.published_at)}</span>
                    <span>읽는 데 {readingMinutes(post.content)}분</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold">연락</h2>
        <ul className="flex flex-col gap-2 text-sm text-ink-soft">
          <li>
            <a
              href={`mailto:${siteEmail}`}
              className="underline underline-offset-4 transition-colors hover:text-ink"
            >
              {siteEmail}
            </a>
          </li>
          <li>
            <a
              href={siteGithub}
              target="_blank"
              rel="noreferrer"
              className="underline underline-offset-4 transition-colors hover:text-ink"
            >
              github.com/woohaharam
            </a>
          </li>
        </ul>
      </section>
    </div>
  );
}
