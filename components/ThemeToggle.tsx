'use client';

import { useSyncExternalStore } from 'react';
import { applyTheme, currentTheme, watchTheme, type Theme } from '@/lib/theme';

/**
 * 첫 칠하기 전에 layout 의 인라인 스크립트가 이미 .dark 를 붙여둔다.
 * 여기서는 그 상태를 읽어와서 버튼 모양만 맞춘다.
 *
 * 테마를 따로 기억해두지 않는다. 진짜 값은 <html> 의 class 하나뿐이고,
 * 그걸 그대로 구독한다. 그래서 다른 데서 테마가 바뀌어도 버튼이 따라간다.
 */
export default function ThemeToggle() {
  const theme = useSyncExternalStore<Theme | null>(
    subscribe,
    currentTheme,
    // 서버에서는 어느 쪽인지 알 수 없다. 붙기 전까지는 자리만 잡아둔다.
    () => null
  );

  if (!theme) return <span className="h-5 w-5" aria-hidden />;

  const label = theme === 'dark' ? '밝은 화면으로' : '어두운 화면으로';

  return (
    <button
      onClick={() => applyTheme(theme === 'dark' ? 'light' : 'dark')}
      aria-label={label}
      title={label}
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

/** useSyncExternalStore 는 정리 함수를 돌려주는 구독 함수를 받는다. */
function subscribe(onChange: () => void): () => void {
  return watchTheme(onChange);
}
