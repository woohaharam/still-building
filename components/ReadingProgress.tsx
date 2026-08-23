'use client';

import { useEffect, useState } from 'react';

/**
 * 글을 얼마나 읽었는지 화면 맨 위에 가는 선으로 보여줘요.
 * 순수하게 장식이라 스크린리더에는 숨깁니다.
 */
export default function ReadingProgress() {
  const [ratio, setRatio] = useState(0);

  useEffect(() => {
    const root = document.documentElement;

    function update() {
      // 스크롤이 아예 생기지 않는 짧은 글에서는 0으로 나누게 되니 먼저 걸러요.
      const scrollable = root.scrollHeight - root.clientHeight;
      if (scrollable <= 0) {
        setRatio(0);
        return;
      }
      setRatio(Math.min(1, Math.max(0, root.scrollTop / scrollable)));
    }

    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);

    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  return (
    <div aria-hidden className="fixed inset-x-0 top-0 z-50 h-0.5">
      <div
        className="h-full bg-accent"
        style={{ width: `${(ratio * 100).toFixed(2)}%` }}
      />
    </div>
  );
}
