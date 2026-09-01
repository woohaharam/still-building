import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import remarkGfm from 'remark-gfm';
import Container from '@/components/Container';
import { countryName, flagEmoji } from '@/lib/country';
import { formatDate } from '@/lib/date';
import { markdownComponents } from '@/lib/markdown';
import { siteUrl } from '@/lib/site';
import { stripMarkdown } from '@/lib/text';
import { stayLabel } from '@/lib/travel';
import { getTripBySlug } from '@/lib/trips';

export const revalidate = 0;

function tripUrl(slug: string) {
  return `${siteUrl}/travel/${encodeURIComponent(slug)}`;
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const trip = await getTripBySlug(decodeURIComponent(params.slug));
  if (!trip) return { title: '여행 기록을 찾을 수 없어요' };

  const where = `${trip.place}, ${countryName(trip.country_code)}`;
  const description = stripMarkdown(trip.journal).slice(0, 150);

  return {
    title: `${where} 여행`,
    description,
    alternates: { canonical: tripUrl(trip.slug) },
    openGraph: {
      title: `${where} 여행`,
      description,
      url: tripUrl(trip.slug),
      type: 'article',
    },
  };
}

export default async function TripPage({
  params,
}: {
  params: { slug: string };
}) {
  const trip = await getTripBySlug(decodeURIComponent(params.slug));
  if (!trip) notFound();

  const period = trip!.ended_on
    ? `${formatDate(trip!.started_on)} — ${formatDate(trip!.ended_on)}`
    : formatDate(trip!.started_on);

  return (
    <Container>
      <article className="flex flex-col gap-8">
        <Link
          href="/travel"
          className="text-sm text-ink-muted transition-colors hover:text-ink"
        >
          ← 목록으로
        </Link>

        <header>
          <p
            className="text-4xl leading-none"
            aria-label={countryName(trip!.country_code)}
          >
            {flagEmoji(trip!.country_code)}
          </p>
          <h1 className="mt-4 text-2xl font-bold leading-snug">
            {trip!.place}
          </h1>
          <p className="mt-2 text-sm text-ink-soft">
            {countryName(trip!.country_code)}
          </p>
          <p className="mt-4 flex flex-wrap items-center gap-3 text-xs text-ink-muted">
            <span>{period}</span>
            <span>{stayLabel(trip!.started_on, trip!.ended_on)}</span>
          </p>
        </header>

        {trip!.cover_image_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={trip!.cover_image_url}
            alt={`${trip!.place} 사진`}
            className="w-full rounded-md border border-line object-cover"
          />
        )}

        <div className="prose-post">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[[rehypeHighlight, { ignoreMissing: true }]]}
            components={markdownComponents}
          >
            {trip!.journal}
          </ReactMarkdown>
        </div>
      </article>
    </Container>
  );
}
