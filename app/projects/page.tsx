import type { Metadata } from 'next';
import Link from 'next/link';
import Container from '@/components/Container';
import Reveal from '@/components/Reveal';
import { PROJECTS } from '@/lib/projects';
import { PUBLICATIONS } from '@/lib/publications';
import { siteUrl } from '@/lib/site';

export const metadata: Metadata = {
  title: '프로젝트',
  description: '직접 만든 것들과, 만들면서 부딪힌 것들.',
  alternates: { canonical: `${siteUrl}/projects` },
};

/** 점 찍힌 목록 — 프로젝트와 논문이 같이 씁니다. */
function Bullets({ items }: { items: string[] }) {
  return (
    <ul className="mt-7 flex flex-col gap-3">
      {items.map((item) => (
        <li
          key={item}
          className="flex gap-3 text-sm leading-relaxed text-ink-soft"
        >
          <span
            aria-hidden
            className="mt-2 h-1 w-1 shrink-0 rounded-full bg-ink-muted"
          />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

/** 기술 스택이나 주요어를 담는 알약 모양 태그. */
function Pills({ items }: { items: string[] }) {
  return (
    <ul className="mt-7 flex flex-wrap gap-2">
      {items.map((item) => (
        <li
          key={item}
          className="rounded-full border border-line px-3 py-1 text-xs text-ink-muted"
        >
          {item}
        </li>
      ))}
    </ul>
  );
}

function ProjectLinks({ links }: { links: { label: string; href: string }[] }) {
  const className =
    'group inline-flex items-center gap-2 text-sm text-ink-soft transition-colors hover:text-ink';

  return (
    <div className="mt-7 flex flex-wrap gap-5">
      {links.map((link) =>
        link.href.startsWith('http') ? (
          <a
            key={link.href}
            href={link.href}
            target="_blank"
            rel="noreferrer"
            className={className}
          >
            {link.label}
            <span className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5">
              ↗
            </span>
          </a>
        ) : (
          <Link key={link.href} href={link.href} className={className}>
            {link.label}
            <span className="transition-transform group-hover:translate-x-0.5">
              →
            </span>
          </Link>
        )
      )}
    </div>
  );
}

export default function ProjectsPage() {
  return (
    <Container>
      <div className="flex flex-col gap-16 pb-6">
        <section>
          <p className="text-xs tracking-[0.22em] text-ink-muted">PROJECTS</p>
          <h1 className="mt-4 text-3xl font-bold tracking-tight">만든 것들</h1>
          <p className="mt-5 leading-relaxed text-ink-soft">
            필요해서 만들었고, 만들면서 막힌 것들을 적어뒀어요.
          </p>
        </section>

        <div className="flex flex-col gap-14">
          {PROJECTS.map((project) => (
            <Reveal key={project.slug}>
              <article className="border-t border-line pt-10">
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <h2 className="text-2xl font-bold tracking-tight">
                    {project.title}
                  </h2>
                  <span className="text-xs tabular-nums text-ink-muted">
                    {project.period}
                  </span>
                </div>

                <p className="mt-2 text-xs text-ink-muted">{project.role}</p>

                <p className="mt-4 leading-relaxed text-ink-soft">
                  {project.summary}
                </p>

                <Bullets items={project.details} />
                <Pills items={project.stack} />
                <ProjectLinks links={project.links} />
              </article>
            </Reveal>
          ))}
        </div>

        {PUBLICATIONS.length > 0 && (
          <section className="flex flex-col gap-14">
            <p className="text-xs tracking-[0.22em] text-ink-muted">PAPER</p>

            {PUBLICATIONS.map((paper) => (
              <Reveal key={paper.slug}>
                <article className="border-t border-line pt-10">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                    <h2 className="text-xl font-bold leading-snug tracking-tight">
                      {paper.title}
                    </h2>
                    {paper.period && (
                      <span className="text-xs tabular-nums text-ink-muted">
                        {paper.period}
                      </span>
                    )}
                  </div>

                  <p className="mt-3 text-xs leading-relaxed text-ink-muted">
                    {paper.authors.map((author, i) => (
                      <span key={author}>
                        {i > 0 && ' · '}
                        <span
                          className={
                            author === paper.me ? 'font-semibold text-ink' : ''
                          }
                        >
                          {author}
                        </span>
                      </span>
                    ))}
                    {' — '}
                    {paper.role}
                    {paper.venue && ` · ${paper.venue}`}
                  </p>

                  <p className="mt-4 leading-relaxed text-ink-soft">
                    {paper.summary}
                  </p>

                  <Bullets items={paper.details} />
                  <Pills items={paper.keywords} />
                </article>
              </Reveal>
            ))}
          </section>
        )}
      </div>
    </Container>
  );
}
