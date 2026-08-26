'use client';

import { useEffect, useRef } from 'react';
import { giscus, giscusEnabled } from '@/lib/site';

const GISCUS_ORIGIN = 'https://giscus.app';

function themeName() {
  return document.documentElement.classList.contains('dark')
    ? 'dark_dimmed'
    : 'light';
}

function injectGiscus(container: HTMLElement) {
  const script = document.createElement('script');
  script.src = `${GISCUS_ORIGIN}/client.js`;
  script.async = true;
  script.crossOrigin = 'anonymous';
  script.setAttribute('data-repo', giscus.repo);
  script.setAttribute('data-repo-id', giscus.repoId);
  script.setAttribute('data-category', giscus.category);
  script.setAttribute('data-category-id', giscus.categoryId);
  // 글 주소를 기준으로 Discussion을 하나씩 만든다.
  script.setAttribute('data-mapping', 'pathname');
  script.setAttribute('data-strict', '0');
  script.setAttribute('data-reactions-enabled', '1');
  script.setAttribute('data-emit-metadata', '0');
  script.setAttribute('data-input-position', 'bottom');
  script.setAttribute('data-theme', themeName());
  script.setAttribute('data-lang', 'ko');
  script.setAttribute('data-loading', 'lazy');
  container.appendChild(script);
}

/**
 * GitHub Discussions에 댓글을 저장하는 giscus.
 * 설정값이 없으면 아무것도 그리지 않는다. 빈 댓글창이 뜨는 것보다 낫다.
 */
export default function Comments() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = ref.current;
    if (!giscusEnabled || !container) return;

    // 개발 모드에서는 effect가 두 번 도니까 스크립트는 한 번만 넣는다.
    // 여기서 통째로 빠져나가면 아래 테마 감시가 안 걸린다.
    if (container.childElementCount === 0) {
      injectGiscus(container);
    }

    /*
      giscus 의 preferred_color_scheme 는 기기 설정을 따라간다.
      이 사이트는 직접 고르는 토글이 있어서, 토글을 눌렀는데 댓글만 밝은 채로
      남는 일이 생긴다. 그래서 <html>의 class를 지켜보다가 iframe에 알려준다.
    */
    const observer = new MutationObserver(() => {
      const frame = container.querySelector<HTMLIFrameElement>(
        'iframe.giscus-frame'
      );
      frame?.contentWindow?.postMessage(
        { giscus: { setConfig: { theme: themeName() } } },
        GISCUS_ORIGIN
      );
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);

  if (!giscusEnabled) return null;

  return (
    <section className="mt-16 border-t border-line pt-10">
      <h2 className="mb-6 text-xs tracking-[0.18em] text-ink-muted">댓글</h2>
      <div ref={ref} />
    </section>
  );
}
