import type { Metadata } from 'next';
import CategoryNav from '@/components/CategoryNav';
import Container from '@/components/Container';
import DiaryGate from '@/components/DiaryGate';
import { siteUrl } from '@/lib/site';

export const metadata: Metadata = {
  title: '일기',
  description: '비밀번호를 아는 사람만 볼 수 있는 기록.',
  alternates: { canonical: `${siteUrl}/blog/diary` },
  // 잠긴 글이라 검색에 걸릴 이유가 없다.
  robots: { index: false, follow: false },
};

export default function DiaryPage() {
  return (
    <Container>
      <div className="flex flex-col gap-8">
        <section>
          <h1 className="text-2xl font-bold leading-snug">일기</h1>
          <p className="mt-3 text-sm leading-relaxed text-ink-soft">
            비밀번호를 아는 사람만 볼 수 있어요.
          </p>
        </section>

        <CategoryNav active="diary" />

        <DiaryGate />
      </div>
    </Container>
  );
}
