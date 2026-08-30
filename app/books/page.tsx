import type { Metadata } from 'next';
import Link from 'next/link';
import Container from '@/components/Container';
import { getPublishedBooks } from '@/lib/books';
import { formatDate } from '@/lib/date';
import { ratingLabel, stars } from '@/lib/rating';
import { siteUrl } from '@/lib/site';

export const revalidate = 0;

export const metadata: Metadata = {
  title: '독후감',
  description: '읽은 책과 남은 생각.',
  alternates: { canonical: `${siteUrl}/books` },
};

export default async function BooksPage() {
  const books = await getPublishedBooks();

  return (
    <Container>
      <div className="flex flex-col gap-8">
        <section>
          <h1 className="text-2xl font-bold leading-snug">독후감</h1>
          <p className="mt-3 text-sm leading-relaxed text-ink-soft">
            읽은 책과, 읽고 나서 남은 생각.
          </p>
        </section>

        {books.length === 0 ? (
          <p className="py-12 text-center text-sm text-ink-muted">
            아직 적어둔 독후감이 없어요.
          </p>
        ) : (
          <ul className="flex flex-col">
            {books.map((book) => (
              <li
                key={book.id}
                className="border-b border-line py-6 first:pt-0"
              >
                <Link
                  href={`/books/${encodeURIComponent(book.slug)}`}
                  className="group flex items-start gap-4"
                >
                  {book.cover_image_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={book.cover_image_url}
                      alt=""
                      loading="lazy"
                      className="h-28 w-20 shrink-0 rounded-md border border-line object-cover"
                    />
                  )}

                  <span className="min-w-0 flex-1">
                    <span className="block text-lg font-semibold transition-colors group-hover:text-accent">
                      {book.title}
                    </span>
                    <span className="mt-1 block text-sm text-ink-soft">
                      {book.author}
                    </span>

                    <span className="mt-3 flex flex-wrap items-center gap-3 text-xs text-ink-muted">
                      {stars(book.rating) && (
                        <span
                          className="text-accent"
                          aria-label={ratingLabel(book.rating)}
                        >
                          {stars(book.rating)}
                        </span>
                      )}
                      {book.finished_at && (
                        <span>{formatDate(book.finished_at)} 읽음</span>
                      )}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Container>
  );
}
