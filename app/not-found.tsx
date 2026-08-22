import Link from 'next/link';
import Container from '@/components/Container';

export default function NotFound() {
  return (
    <Container>
      <div className="py-20 text-center">
        <h1 className="text-xl font-bold">찾는 글이 없어요</h1>
        <p className="mt-3 text-sm leading-relaxed text-ink-soft">
          주소가 바뀌었거나, 아직 발행하지 않은 글일 수 있어요.
        </p>
        <Link
          href="/blog"
          className="mt-6 inline-block text-sm text-ink-muted underline underline-offset-4 transition-colors hover:text-ink"
        >
          목록으로 돌아가기
        </Link>
      </div>
    </Container>
  );
}
