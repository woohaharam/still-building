import Image from 'next/image';
import Link from 'next/link';
import Reveal from '@/components/Reveal';
import { PROJECTS } from '@/lib/projects';
import { PUBLICATIONS } from '@/lib/publications';
import { siteAuthor, siteAuthorAlias, siteGithub } from '@/lib/site';

interface Section {
  index: string;
  href: string;
  label: string;
  description: string;
  meta: string;
}

export default function Landing({
  postCount,
  failed,
}: {
  postCount: number;
  failed: boolean;
}) {
  const sections: Section[] = [
    {
      index: '01',
      href: '/about',
      label: '소개',
      description: '어떤 사람이고 지금 뭘 배우고 있는지',
      meta: `${siteAuthor} · ${siteAuthorAlias}`,
    },
    {
      index: '02',
      href: '/projects',
      label: '프로젝트',
      description: '만든 것들과, 만들다 막혔던 것들',
      meta: `${PROJECTS.length}개 · 논문 ${PUBLICATIONS.length}편`,
    },
    {
      index: '03',
      href: '/blog',
      label: '블로그',
      description: '개발하며 배운 것과 그 사이의 일상',
      meta: failed ? '' : `글 ${postCount}편`,
    },
    {
      index: '04',
      href: '/books',
      label: '독후감',
      description: '읽은 책과, 읽고 나서 남은 생각',
      meta: '',
    },
    {
      index: '05',
      href: '/travel',
      label: '여행',
      description: '다녀온 곳과, 거기서 남은 기록',
      meta: '',
    },
    {
      index: '06',
      href: '/calendar',
      label: '캘린더',
      description: '앞으로의 일정과 지금까지 글 쓴 날들',
      meta: '',
    },
  ];

  return (
    <div className="flex flex-col gap-24 pb-10 sm:gap-32">
      <section className="flex min-h-[72vh] flex-col justify-center gap-10 sm:flex-row sm:items-center sm:gap-14">
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
            필요한 걸 직접 만들고, 만들다 막힌 지점을 남깁니다. 지금은 이
            사이트를 처음부터 만들면서 웹을 배우는 중이에요.
          </p>

          <div
            className="rise mt-10 flex flex-wrap gap-3"
            style={{ animationDelay: '340ms' }}
          >
            <Link
              href="/about"
              className="group inline-flex items-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-medium text-paper transition-opacity hover:opacity-90"
            >
              소개 보기
              <span className="transition-transform group-hover:translate-x-0.5">
                →
              </span>
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

      <Reveal>
        <nav aria-label="사이트 안내">
          <ul className="flex flex-col">
            {sections.map((section) => (
              <li key={section.href}>
                <Link
                  href={section.href}
                  className="group flex items-center gap-5 border-t border-line py-7 last:border-b sm:gap-8 sm:py-9"
                >
                  <span className="text-xs tabular-nums text-ink-muted">
                    {section.index}
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="block text-xl font-bold tracking-tight transition-colors group-hover:text-accent sm:text-2xl">
                      {section.label}
                    </span>
                    <span className="mt-2 block text-sm leading-relaxed text-ink-soft">
                      {section.description}
                    </span>
                  </span>

                  {section.meta && (
                    <span className="hidden shrink-0 text-xs tabular-nums text-ink-muted sm:block">
                      {section.meta}
                    </span>
                  )}

                  <span className="shrink-0 text-ink-muted transition-transform group-hover:translate-x-1">
                    →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </Reveal>
    </div>
  );
}
