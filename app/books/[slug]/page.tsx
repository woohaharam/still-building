import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import remarkGfm from 'remark-gfm';
import Container from '@/components/Container';
import JsonLd from '@/components/JsonLd';
import { getBookBySlug } from '@/lib/books';
import { formatDate } from '@/lib/date';
import { markdownComponents } from '@/lib/markdown';
import { ratingLabel, stars } from '@/lib/rating';
import { siteAuthor, siteUrl } from '@/lib/site';
import { stripMarkdown } from '@/lib/text';

export const revalidate = 0;

function bookUrl(slug: string) {
  return `${siteUrl}/books/${encodeURIComponent(slug)}`;
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const book = await getBookBySlug(decodeURIComponent(params.slug));
  if (!book) return { title: '독후감을 찾을 수 없어요' };

  const description = stripMarkdown(book.review).slice(0, 150);

  return {
    title: `${book.title} — 독후감`,
    description,
    alternates: { canonical: bookUrl(book.slug) },
    openGraph: {
      title: `${book.title} — 독후감`,
      description,
      url: bookUrl(book.slug),
      type: 'article',
    },
  };
}

export default async function BookPage({
  params,
}: {
  params: { slug: string };
}) {
  const book = await getBookBySlug(decodeURIComponent(params.slug));
  if (!book) notFound();

  const url = bookUrl(book!.slug);

  return (
    <Container>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Review',
          url,
          inLanguage: 'ko-KR',
          author: { '@type': 'Person', name: siteAuthor },
          itemReviewed: {
            '@type': 'Book',
            name: book!.title,
            author: { '@type': 'Person', name: book!.author },
          },
          ...(book!.rating
            ? {
                reviewRating: {
                  '@type': 'Rating',
                  ratingValue: book!.rating,
                  bestRating: 5,
                  worstRating: 1,
                },
              }
            : {}),
        }}
      />

      <article className="flex flex-col gap-8">
        <Link
          href="/books"
          className="text-sm text-ink-muted transition-colors hover:text-ink"
        >
          ← 목록으로
        </Link>

        <header className="flex items-start gap-5">
          {book!.cover_image_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={book!.cover_image_url}
              alt={`${book!.title} 표지`}
              className="h-36 w-24 shrink-0 rounded-md border border-line object-cover"
            />
          )}

          <div className="min-w-0">
            <h1 className="text-2xl font-bold leading-snug">{book!.title}</h1>
            <p className="mt-2 text-sm text-ink-soft">{book!.author}</p>

            <p className="mt-4 flex flex-wrap items-center gap-3 text-xs text-ink-muted">
              {stars(book!.rating) && (
                <span
                  className="text-base text-accent"
                  aria-label={ratingLabel(book!.rating)}
                >
                  {stars(book!.rating)}
                </span>
              )}
              {book!.finished_at && (
                <span>{formatDate(book!.finished_at)} 읽음</span>
              )}
            </p>
          </div>
        </header>

        <div className="prose-post">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[[rehypeHighlight, { ignoreMissing: true }]]}
            components={markdownComponents}
          >
            {book!.review}
          </ReactMarkdown>
        </div>
      </article>
    </Container>
  );
}
