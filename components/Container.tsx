import type { ReactNode } from 'react';

/**
 * 페이지 가로폭. 글은 읽기 좋은 680px로 좁게, 랜딩은 넓게 쓴다.
 */
export default function Container({
  wide = false,
  className = '',
  children,
}: {
  wide?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={`mx-auto w-full px-6 ${wide ? 'max-w-4xl' : 'max-w-content'} ${className}`}
    >
      {children}
    </div>
  );
}
