import type { Metadata } from 'next';
import Link from 'next/link';
import Container from '@/components/Container';
import Reveal from '@/components/Reveal';
import Bullets from '@/components/project/Bullets';
import Pills from '@/components/project/Pills';
import ProjectLinks from '@/components/project/ProjectLinks';
import { PROJECTS } from '@/lib/projects';
import { PUBLICATIONS } from '@/lib/publications';
import { siteUrl } from '@/lib/site';

export const metadata: Metadata = {
  title: '프로젝트',
  description: '직접 만든 것들과, 만들면서 부딪힌 것들.',
  alternates: { canonical: `${siteUrl}/projects` },
};

/** 인원 · 기여도 · 기간처럼 짧은 사실들을 한 줄로. */
function Facts({ items }: { items: (string | undefined)[] }) {
  const shown = items.filter(Boolean) as string[];
  if (shown.length === 0) return null;

  return (
    <p className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-ink-muted">
      {shown.map((item, i) => (
        <span key={item}>
          {i > 0 && <span className="mr-3 opacity-50">·</span>}
          {item}
        </span>
      ))}
    </p>
  );
}

export default function ProjectsPage() {
  return (
    <Container wide>
      <div className="flex flex-col gap-16 pb-6">
        <section>
          <p className="text-xs tracking-[0.22em] text-ink-muted">PROJECTS</p>
          <h1 className="mt-4 text-3xl font-bold tracking-tight">만든 것들</h1>
          <p className="mt-5 leading-relaxed text-ink-soft">
            필요해서 만들었고, 만들면서 막힌 것들을 적어뒀어요. 제목을 누르면
            구조도와 트러블슈팅까지 볼 수 있어요.
          </p>
        </section>

        <div className="flex flex-col gap-12">
          {PROJECTS.map((project) => (
            <Reveal key={project.slug}>
              <article className="border-t border-line pt-10">
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <h2 className="text-2xl font-bold tracking-tight">
                    <Link
                      href={`/projects/${project.slug}`}
                      className="transition-colors hover:text-accent"
                    >
                      {project.title}
                    </Link>
                  </h2>
                  <span className="text-xs tabular-nums text-ink-muted">
                    {project.period}
                  </span>
                </div>

                <Facts
                  items={[
                    project.role,
                    project.team && `개발 인원 ${project.team}`,
                    project.contribution && `기여도 ${project.contribution}`,
                  ]}
                />

                <p className="mt-4 leading-relaxed text-ink-soft">
                  {project.summary}
                </p>

                {project.impact && <Bullets items={project.impact} />}

                <Pills items={project.stack} />

                <ProjectLinks
                  links={[
                    { label: '자세히 보기', href: `/projects/${project.slug}` },
                    ...project.links,
                  ]}
                />
              </article>
            </Reveal>
          ))}
        </div>

        {PUBLICATIONS.length > 0 && (
          <section className="flex flex-col gap-12">
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
