/**
 * 테마는 <html> 의 class 하나로만 표시된다.
 *
 * 첫 칠하기 전에 layout 의 인라인 스크립트가 저장된 설정을 읽어 .dark 를
 * 붙여둔다. 그래서 이 값은 서버에서는 알 수 없고, 브라우저에서만 읽힌다.
 * 바뀌는 걸 알려주는 이벤트가 따로 없어서 class 를 직접 지켜본다.
 */

export type Theme = 'light' | 'dark';

export function isDarkTheme(): boolean {
  return document.documentElement.classList.contains('dark');
}

export function currentTheme(): Theme {
  return isDarkTheme() ? 'dark' : 'light';
}

/** 테마가 바뀌면 알려준다. 정리 함수를 돌려준다. */
export function watchTheme(onChange: (dark: boolean) => void): () => void {
  const observer = new MutationObserver(() => onChange(isDarkTheme()));

  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class'],
  });

  return () => observer.disconnect();
}

/** 테마를 바꾸고 다음 방문에도 남도록 적어둔다. */
export function applyTheme(next: Theme): void {
  document.documentElement.classList.toggle('dark', next === 'dark');
  try {
    localStorage.setItem('theme', next);
  } catch {
    // 저장이 막혀 있어도 이번 방문 동안은 바뀐 채로 쓴다.
  }
}
