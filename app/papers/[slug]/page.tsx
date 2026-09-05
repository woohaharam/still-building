import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Container from '@/components/Container';
import Reveal from '@/components/Reveal';
import Pills from '@/components/project/Pills';
import BackLink from '@/components/project/BackLink';
import ProjectLinks from '@/components/project/ProjectLinks';
import { PUBLICATIONS, getPublication } from '@/lib/publications';
import { siteUrl } from '@/lib/site';

/**
 * 논문 목록은 빌드 시점에 다 안다. 여기 없는 주소는 Next 가 곧바로
 * 404 로 돌려보낸다.
 */
export const dynamicParams = false;

export function generateStaticParams() {
  return PUBLICATIONS.map((paper) => ({ slug: paper.slug }));
}

export function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Metadata {
  const paper = getPublication(params.slug);
  if (!paper) return { title: '논문을 찾을 수 없어요' };

  return {
    title: paper.title,
    description: paper.summary,
    alternates: { canonical: `${siteUrl}/papers/${paper.slug}` },
    openGraph: {
      title: paper.title,
      description: paper.summary,
      url: `${siteUrl}/papers/${paper.slug}`,
      type: 'article',
    },
  };
}

export default function PaperPage({ params }: { params: { slug: string } }) {
  const paper = getPublication(params.slug);
  if (!paper) notFound();

  const { title, authors, me, role, summary, venue, period } = paper!;

  return (
    <Container wide>
      <div className="flex flex-col gap-16 pb-6">
        <section>
          <div className="mb-8">
            <BackLink href="/papers" label="논문 목록" />
          </div>

          <h1 className="mt-4 text-2xl font-bold leading-snug tracking-tight sm:text-3xl">
            {title}
          </h1>

          <p className="mt-5 text-sm leading-relaxed text-ink-muted">
            {authors.map((author, i) => (
              <span key={author}>
                {i > 0 && ' · '}
                <span className={author === me ? 'font-semibold text-ink' : ''}>
                  {author}
                </span>
              </span>
            ))}
          </p>
          <p className="mt-1 text-xs text-ink-muted">
            {role}
            {venue && ` · ${venue}`}
            {period && ` · ${period}`}
          </p>

          <p className="mt-6 max-w-2xl leading-relaxed text-ink-soft">
            {summary}
          </p>

          <Pills items={paper!.keywords} />

          {paper!.documents && paper!.documents.length > 0 && (
            <ProjectLinks links={paper!.documents} />
          )}
        </section>

        {paper!.numbers && paper!.numbers.length > 0 && (
          <Reveal>
            <section>
              <h2 className="mb-8 text-xl font-bold tracking-tight">
                숫자로 본 결과
              </h2>
              <dl className="grid gap-x-8 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
                {paper!.numbers.map((row) => (
                  <div key={row.label} className="border-t border-line pt-4">
                    <dt className="text-xs text-ink-muted">{row.label}</dt>
                    <dd className="mt-1 font-semibold tabular-nums">
                      {row.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
          </Reveal>
        )}

        {paper!.sections?.map((section) => (
          <Reveal key={section.title}>
            <section className="border-t border-line pt-8">
              <h2 className="text-lg font-bold tracking-tight">
                {section.title}
              </h2>
              <div className="mt-5 flex max-w-2xl flex-col gap-4">
                {section.body.map((paragraph) => (
                  <p
                    key={paragraph}
                    className="text-sm leading-relaxed text-ink-soft"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            </section>
          </Reveal>
        ))}
      </div>
    </Container>
  );
}
