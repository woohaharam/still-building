import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import Container from '@/components/Container';
import Reveal from '@/components/Reveal';
import {
  siteAuthor,
  siteAuthorAlias,
  siteEmail,
  siteGithub,
  siteUrl,
} from '@/lib/site';

export const metadata: Metadata = {
  title: '소개',
  description: `${siteAuthor}(${siteAuthorAlias}) — 필요한 걸 직접 만들고, 만들면서 배운 걸 기록합니다.`,
  alternates: { canonical: `${siteUrl}/about` },
};

const NOW = [
  '이 블로그를 처음부터 만들면서 웹 개발을 배우고 있어요. 화면을 그리는 것보다 데이터가 오가는 쪽에서 막히는 일이 많았고, 그게 더 재미있었어요.',
  '막힌 지점을 그때그때 글로 남기고 있어요. 나중에 같은 데서 막힐 사람이 검색으로 닿을 수 있게요.',
];

const STACK = [
  { group: '쓰는 것', items: ['TypeScript', 'React', 'Next.js', 'Tailwind CSS'] },
  { group: '붙여본 것', items: ['Supabase (Postgres · Auth · Storage)', 'Vercel', 'GitHub Actions'] },
  { group: '배우는 중', items: ['테스트 작성', '접근성', '검색엔진 최적화'] },
];

export default function AboutPage() {
  return (
    <Container>
      <div className="flex flex-col gap-20 pb-6">
        <section className="flex flex-col gap-8 sm:flex-row sm:items-start sm:gap-10">
          <Image
            src="/profile.jpg"
            alt={`${siteAuthor} 프로필 사진`}
            width={750}
            height={1000}
            priority
            className="h-auto w-[124px] shrink-0 rounded-2xl border border-line object-cover sm:w-[168px]"
          />
          <div>
            <p className="text-xs tracking-[0.22em] text-ink-muted">ABOUT</p>
            <h1 className="mt-4 text-3xl font-bold tracking-tight">
              {siteAuthor}
              <span className="ml-3 text-lg font-medium text-ink-muted">
                {siteAuthorAlias}
              </span>
            </h1>
            <p className="mt-5 leading-relaxed text-ink-soft">
              필요한 걸 직접 만들고, 그 과정에서 막힌 지점과 알게 된 것을
              남깁니다. 잘 만드는 것보다 왜 그렇게 되는지 아는 쪽에 관심이 있어요.
            </p>
          </div>
        </section>

        <Reveal>
          <section>
            <h2 className="mb-6 text-xs tracking-[0.18em] text-ink-muted">NOW</h2>
            <div className="flex flex-col gap-4">
              {NOW.map((line) => (
                <p key={line} className="leading-relaxed text-ink-soft">
                  {line}
                </p>
              ))}
            </div>
          </section>
        </Reveal>

        <Reveal>
          <section>
            <h2 className="mb-6 text-xs tracking-[0.18em] text-ink-muted">STACK</h2>
            <dl className="flex flex-col gap-6">
              {STACK.map((row) => (
                <div key={row.group} className="sm:flex sm:gap-8">
                  <dt className="w-24 shrink-0 text-sm text-ink-muted">
                    {row.group}
                  </dt>
                  <dd className="mt-2 flex flex-wrap gap-2 sm:mt-0">
                    {row.items.map((item) => (
                      <span
                        key={item}
                        className="rounded-full border border-line px-3 py-1 text-xs text-ink-soft"
                      >
                        {item}
                      </span>
                    ))}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        </Reveal>

        <Reveal>
          <section>
            <h2 className="mb-6 text-xs tracking-[0.18em] text-ink-muted">CONTACT</h2>
            <div className="flex flex-col">
              <a
                href={`mailto:${siteEmail}`}
                className="group flex items-center justify-between border-b border-line py-5"
              >
                <span className="font-medium transition-colors group-hover:text-accent">
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
                className="group flex items-center justify-between border-b border-line py-5"
              >
                <span className="font-medium transition-colors group-hover:text-accent">
                  github.com/woohaharam
                </span>
                <span className="text-ink-muted transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5">
                  ↗
                </span>
              </a>
            </div>

            <Link
              href="/projects"
              className="group mt-8 inline-flex items-center gap-2 text-sm text-ink-soft transition-colors hover:text-ink"
            >
              만든 것들 보기
              <span className="transition-transform group-hover:translate-x-0.5">→</span>
            </Link>
          </section>
        </Reveal>
      </div>
    </Container>
  );
}
