import Image from 'next/image';
import Link from 'next/link';
import Reveal from '@/components/Reveal';
import { readingMinutes } from '@/lib/reading';
import { siteAuthor, siteAuthorAlias, siteEmail, siteGithub } from '@/lib/site';
import { Post } from '@/lib/types';

function formatDate(value: string | null) {
  if (!value) return '';
  const d = new Date(value);
  return `${d.getFullYear()}. ${`${d.getMonth() + 1}`.padStart(2, '0')}. ${`${d.getDate()}`.padStart(2, '0')}.`;
}

function SectionLabel({ index, children }: { index: string; children: string }) {
  return (
    <div className="mb-7 flex items-center gap-3">
      <span className="text-xs tabular-nums text-ink-muted">{index}</span>
      <span className="h-px flex-1 bg-line" />
      <span className="text-xs tracking-[0.18em] text-ink-muted">{children}</span>
    </div>
  );
}

export default function Landing({
  posts,
  total,
  failed,
}: {
  posts: Post[];
  total: number;
  failed: boolean;
}) {
  return (
    <div className="flex flex-col gap-28 pb-10 sm:gap-36">
      {/* 첫 화면 */}
      <section className="flex min-h-[78vh] flex-col justify-center gap-10 sm:flex-row sm:items-center sm:gap-14">
        <div className="order-2 flex-1 sm:order-1">
          <p
            className="rise text-xs tracking-[0.22em] text-ink-muted"
            style={{ animationDelay: '60ms' }}
          >
            {siteAuthor} · {siteAuthorAlias}
          </p>

          <h1
            className="rise mt-6 text-[2.75rem] font-bold leading-[1.08] tracking-tight sm:text-6xl"
            style={{ animationDelay: '140ms' }}
          >
            만들면서
            <br />
            배우고 있습니다.
          </h1>

          <p
            className="rise mt-7 max-w-md leading-relaxed text-ink-soft"
            style={{ animationDelay: '240ms' }}
          >
            필요한 걸 직접 만들고, 그 과정에서 막힌 지점과 알게 된 것을 남깁니다.
            지금은 이 블로그를 처음부터 만들면서 웹을 배우는 중이에요.
          </p>

          <div
            className="rise mt-10 flex flex-wrap gap-3"
            style={{ animationDelay: '340ms' }}
          >
            <Link
              href="/blog"
              className="group inline-flex items-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-medium text-paper transition-opacity hover:opacity-90"
            >
              블로그 보기
              <span className="transition-transform group-hover:translate-x-0.5">→</span>
            </Link>
            <a
              href={siteGithub}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center rounded-full border border-line px-5 py-3 text-sm font-medium text-ink-soft transition-colors hover:border-ink-muted hover:text-ink"
            >
              GitHub
            </a>
          </div>

          <div
            className="rise mt-16 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-ink-muted"
            style={{ animationDelay: '460ms' }}
          >
            <span className="tabular-nums">시작 2026. 08. 15.</span>
            {!failed && <span className="tabular-nums">글 {total}편</span>}
            <span>Next.js · TypeScript · Supabase</span>
          </div>

        </div>

        <div className="order-1 shrink-0 sm:order-2">
          <Image
            src="/profile.jpg"
            alt={`${siteAuthor} 프로필 사진`}
            width={750}
            height={1000}
            priority
            className="rise h-auto w-[132px] rounded-2xl border border-line object-cover sm:w-[264px]"
            style={{ animationDelay: '200ms' }}
          />
        </div>
      </section>

      {/* 만든 것들 */}
      <Reveal>
        <section>
          <SectionLabel index="01">MADE</SectionLabel>

          <a
            href={`${siteGithub}/still-building`}
            target="_blank"
            rel="noreferrer"
            className="group block rounded-xl border border-line p-7 transition-colors hover:border-ink-muted sm:p-9"
          >
            <div className="flex items-start justify-between gap-4">
              <h2 className="text-xl font-bold tracking-tight">STILL BUILDING</h2>
              <span className="mt-1 shrink-0 text-ink-muted transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5">
                ↗
              </span>
            </div>
            <p className="mt-4 leading-relaxed text-ink-soft">
              지금 보고 계신 블로그. 글쓰기와 일정을 한 곳에서 관리하려고 직접
              만들었어요. 달력, 검색, 다크 모드, 링크 미리보기 카드까지 붙어 있고,
              글은 관리자 페이지에서 마크다운으로 씁니다.
            </p>
            <ul className="mt-6 flex flex-wrap gap-2">
              {['Next.js 14', 'TypeScript', 'Tailwind', 'Supabase', 'Vercel'].map(
                (tech) => (
                  <li
                    key={tech}
                    className="rounded-full border border-line px-3 py-1 text-xs text-ink-muted"
                  >
                    {tech}
                  </li>
                )
              )}
            </ul>
          </a>
        </section>
      </Reveal>

      {/* 최근 글 */}
      <Reveal>
        <section>
          <SectionLabel index="02">WRITING</SectionLabel>

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
            <>
              <ul className="flex flex-col">
                {posts.map((post) => (
                  <li key={post.id} className="border-b border-line">
                    <Link
                      href={`/posts/${encodeURIComponent(post.slug)}`}
                      className="group flex items-baseline gap-4 py-5 transition-colors"
                    >
                      <span className="shrink-0 text-xs tabular-nums text-ink-muted">
                        {formatDate(post.published_at)}
                      </span>
                      <span className="flex-1 font-medium leading-snug transition-colors group-hover:text-accent">
                        {post.title}
                      </span>
                      <span className="hidden shrink-0 text-xs text-ink-muted sm:block">
                        {readingMinutes(post.content)}분
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>

              <Link
                href="/blog"
                className="group mt-7 inline-flex items-center gap-2 text-sm text-ink-soft transition-colors hover:text-ink"
              >
                글 전체 보기
                <span className="transition-transform group-hover:translate-x-0.5">
                  →
                </span>
              </Link>
            </>
          )}
        </section>
      </Reveal>

      {/* 연락 */}
      <Reveal>
        <section>
          <SectionLabel index="03">CONTACT</SectionLabel>

          <div className="flex flex-col">
            <a
              href={`mailto:${siteEmail}`}
              className="group flex items-center justify-between border-b border-line py-5 transition-colors"
            >
              <span className="text-lg font-medium transition-colors group-hover:text-accent">
                {siteEmail}
              </span>
              <span className="text-ink-muted transition-transform group-hover:translate-x-0.5">
                →
              </span>
            </a>
            <a
              href={siteGithub}
              target="_blank"
              rel="noreferrer"
              className="group flex items-center justify-between border-b border-line py-5 transition-colors"
            >
              <span className="text-lg font-medium transition-colors group-hover:text-accent">
                github.com/woohaharam
              </span>
              <span className="text-ink-muted transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5">
                ↗
              </span>
            </a>
          </div>
        </section>
      </Reveal>
    </div>
  );
}
