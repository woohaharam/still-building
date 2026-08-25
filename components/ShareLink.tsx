'use client';

import { useEffect, useState } from 'react';
import { formatCount } from '@/lib/count';
import { countShare } from '@/lib/stats';

/** 글 주소를 복사하거나 X로 바로 보내는 버튼. */
export default function ShareLink({
  url,
  title,
  slug,
  shareCount,
}: {
  url: string;
  title: string;
  slug: string;
  shareCount: number;
}) {
  const [copied, setCopied] = useState(false);
  // 서버가 그려준 숫자에서 시작해, 이 화면에서 누른 만큼만 더해 보여준다.
  const [shares, setShares] = useState(shareCount);

  function recordShare() {
    setShares((n) => n + 1);
    countShare(slug);
  }

  // 복사했다는 표시를 잠깐 보여주고 되돌립니다.
  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 1800);
    return () => clearTimeout(timer);
  }, [copied]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      recordShare();
    } catch {
      // 클립보드를 막아둔 브라우저에서는 주소를 그대로 보여준다.
      window.prompt('아래 주소를 복사해 주세요', url);
    }
  }

  const buttonClass =
    'rounded-full border border-line px-3 py-1.5 text-xs text-ink-soft transition-colors hover:border-ink-muted hover:text-ink';

  return (
    <div className="mt-14 flex flex-wrap items-center gap-2 border-t border-line pt-6">
      <span className="mr-1 text-xs text-ink-muted">이 글 공유하기</span>
      <button type="button" onClick={copy} className={buttonClass}>
        {copied ? '복사했어요' : '링크 복사'}
      </button>
      <a
        href={`https://x.com/intent/tweet?text=${encodeURIComponent(
          title
        )}&url=${encodeURIComponent(url)}`}
        target="_blank"
        rel="noreferrer"
        onClick={recordShare}
        className={buttonClass}
      >
        X
      </a>
      {shares > 0 && (
        <span className="ml-1 text-xs text-ink-muted">
          {formatCount(shares)}번 공유됨
        </span>
      )}
    </div>
  );
}
