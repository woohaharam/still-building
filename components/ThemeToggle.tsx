'use client';

import { useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

/**
 * 첫 칠하기 전에 layout의 인라인 스크립트가 이미 .dark를 붙여둔다.
 * 여기서는 그 상태를 읽어와서 버튼 모양만 맞춥니다.
 */
export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    setTheme(
      document.documentElement.classList.contains('dark') ? 'dark' : 'light'
    );
  }, []);

  function toggle() {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.classList.toggle('dark', next === 'dark');
    try {
      localStorage.setItem('theme', next);
    } catch {
      // 저장이 막혀 있어도 이번 방문 동안은 바뀐 채로 쓴다.
    }
    setTheme(next);
  }

  // 서버에서는 어느 쪽인지 알 수 없어서, 자리만 잡아두고 마운트 후에 그린다.
  if (!theme) return <span className="h-5 w-5" aria-hidden />;

  return (
    <button
      onClick={toggle}
      aria-label={theme === 'dark' ? '밝은 화면으로' : '어두운 화면으로'}
      title={theme === 'dark' ? '밝은 화면으로' : '어두운 화면으로'}
      className="transition-colors hover:text-ink"
    >
      {theme === 'dark' ? (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
          <circle cx="12" cy="12" r="4.2" fill="currentColor" />
          <g stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
            <path d="M12 2.6v2.2M12 19.2v2.2M21.4 12h-2.2M4.8 12H2.6" />
            <path d="M18.6 5.4l-1.6 1.6M7 17l-1.6 1.6M18.6 18.6L17 17M7 7L5.4 5.4" />
          </g>
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
          <path
            d="M20.2 14.2A8.4 8.4 0 0 1 9.8 3.8a8.4 8.4 0 1 0 10.4 10.4Z"
            fill="currentColor"
          />
        </svg>
      )}
    </button>
  );
}
