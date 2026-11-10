import type { Metadata } from 'next';
import Link from 'next/link';
import Container from '@/components/Container';
import PhotoGrid from '@/components/PhotoGrid';
import { getPublicPhotos } from '@/lib/photos';
import { siteUrl } from '@/lib/site';

export const revalidate = 0;

export const metadata: Metadata = {
  title: '사진첩',
  description: '찍어둔 것들.',
  alternates: { canonical: `${siteUrl}/photos` },
};

export default async function PhotosPage() {
  const photos = await getPublicPhotos();

  return (
    <Container>
      <div className="flex flex-col gap-8">
        <section>
          <h1 className="text-2xl font-bold leading-snug">사진첩</h1>
          <p className="mt-3 text-sm leading-relaxed text-ink-soft">
            찍어둔 것들을 모아뒀어요. 누르면 크게 볼 수 있어요.
          </p>
        </section>

        <PhotoGrid photos={photos} />

        <p className="text-xs text-ink-muted">
          <Link href="/photos/private" className="hover:text-ink-soft">
            비공개 사진첩 →
          </Link>
        </p>
      </div>
    </Container>
  );
}
