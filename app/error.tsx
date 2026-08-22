'use client';

import { useEffect } from 'react';
import Container from '@/components/Container';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Container>
      <div className="py-20 text-center">
        <h1 className="text-xl font-bold">잠깐 문제가 생겼어요</h1>
        <p className="mt-3 text-sm leading-relaxed text-ink-soft">
          글을 불러오는 데 실패했어요. 잠시 뒤에 다시 시도해보세요.
        </p>
        <button
          onClick={reset}
          className="mt-6 rounded-md bg-ink px-4 py-2 text-sm font-medium text-paper"
        >
          다시 시도
        </button>
      </div>
    </Container>
  );
}
