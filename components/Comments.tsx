'use client';

import { useEffect, useRef } from 'react';
import { giscus, giscusEnabled } from '@/lib/site';

/**
 * GitHub Discussions에 댓글을 저장하는 giscus.
 * 설정값이 없으면 아무것도 그리지 않아요 — 빈 댓글창이 뜨는 것보다 낫습니다.
 */
export default function Comments() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = ref.current;
    if (!giscusEnabled || !container || container.childElementCount > 0) return;

    const dark = document.documentElement.classList.contains('dark');

    const script = document.createElement('script');
    script.src = 'https://giscus.app/client.js';
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.setAttribute('data-repo', giscus.repo);
    script.setAttribute('data-repo-id', giscus.repoId);
    script.setAttribute('data-category', giscus.category);
    script.setAttribute('data-category-id', giscus.categoryId);
    // 글 주소를 기준으로 Discussion을 하나씩 만들어요.
    script.setAttribute('data-mapping', 'pathname');
    script.setAttribute('data-reactions-enabled', '1');
    script.setAttribute('data-emit-metadata', '0');
    script.setAttribute('data-input-position', 'top');
    script.setAttribute('data-theme', dark ? 'dark_dimmed' : 'light');
    script.setAttribute('data-lang', 'ko');
    script.setAttribute('data-loading', 'lazy');

    container.appendChild(script);
  }, []);

  if (!giscusEnabled) return null;

  return (
    <section className="mt-16 border-t border-line pt-10">
      <h2 className="mb-6 text-xs tracking-[0.18em] text-ink-muted">댓글</h2>
      <div ref={ref} />
    </section>
  );
}
