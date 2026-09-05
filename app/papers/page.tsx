import type { Metadata } from 'next';
import Link from 'next/link';
import Container from '@/components/Container';
import Reveal from '@/components/Reveal';
import WorkNav from '@/components/WorkNav';
import Bullets from '@/components/project/Bullets';
import Pills from '@/components/project/Pills';
import ProjectLinks from '@/components/project/ProjectLinks';
import { PUBLICATIONS } from '@/lib/publications';
import { siteUrl } from '@/lib/site';

export const metadata: Metadata = {
  title: '논문',
  description: '학부에서 쓴 논문.',
  alternates: { canonical: `${siteUrl}/papers` },
};

export default function PapersPage() {
  return (
    <Container wide>
      <div className="flex flex-col gap-16 pb-6">
        <section className="flex flex-col gap-6">
          <div>
            <h1 className="mt-4 text-3xl font-bold tracking-tight">논문</h1>
            <p className="mt-5 leading-relaxed text-ink-soft">
              학부에서 쓴 논문입니다. 제목을 누르면 방법과 결과를 볼 수 있어요.
            </p>
          </div>

          <WorkNav active="papers" counts={{ papers: PUBLICATIONS.length }} />
        </section>

        {PUBLICATIONS.length === 0 ? (
          <p className="py-12 text-center text-sm text-ink-muted">
            아직 등록한 논문이 없어요.
          </p>
        ) : (
          <div className="flex flex-col gap-12">
            {PUBLICATIONS.map((paper) => (
              <Reveal key={paper.slug}>
                <article className="border-t border-line pt-10">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                    <h2 className="text-xl font-bold leading-snug tracking-tight">
                      <Link
                        href={`/papers/${paper.slug}`}
                        className="transition-colors hover:text-accent"
                      >
                        {paper.title}
                      </Link>
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
                  <ProjectLinks
                    links={[
                      { label: '자세히 보기', href: `/papers/${paper.slug}` },
                      ...(paper.documents ?? []),
                    ]}
                  />
                </article>
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </Container>
  );
}
