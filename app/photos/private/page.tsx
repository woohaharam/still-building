import type { Metadata } from 'next';
import Link from 'next/link';
import Container from '@/components/Container';
import PhotoGate from '@/components/PhotoGate';
import { siteUrl } from '@/lib/site';

export const metadata: Metadata = {
  title: '비공개 사진첩',
  description: '비밀번호를 아는 사람만 볼 수 있는 사진.',
  alternates: { canonical: `${siteUrl}/photos/private` },
  // 잠긴 사진이라 검색에 걸릴 이유가 없다.
  robots: { index: false, follow: false },
};

export default function PrivatePhotosPage() {
  return (
    <Container>
      <div className="flex flex-col gap-8">
        <section>
          <h1 className="text-2xl font-bold leading-snug">비공개 사진첩</h1>
          <p className="mt-3 text-sm leading-relaxed text-ink-soft">
            비밀번호를 아는 사람만 볼 수 있어요.
          </p>
        </section>

        <PhotoGate />

        <p className="text-xs text-ink-muted">
          <Link href="/photos" className="hover:text-ink-soft">
            ← 공개 사진첩
          </Link>
        </p>
      </div>
    </Container>
  );
}
