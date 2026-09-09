/**
 * 지도 타일.
 *
 * OpenStreetMap 기본 타일은 색이 강해서 사이트 톤과 겉돌고, 다크 모드에서는
 * 화면에 흰 판 하나가 박힌 것처럼 보인다. CARTO 가 같은 OSM 데이터로 만든
 * 옅은 판을 쓰면 밝고 어두운 짝이 다 있어서 테마를 따라갈 수 있다.
 *
 * 저작권 표시는 지도 위에 그대로 남긴다. 두 곳 다 그게 이용 조건이다.
 */
export const TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>';

export function tileUrl(dark: boolean): string {
  const style = dark ? 'dark_all' : 'light_all';
  return `https://{s}.basemaps.cartocdn.com/${style}/{z}/{x}/{y}{r}.png`;
}

/** 지금 어두운 테마인지. 테마는 <html> 의 class 로만 표시된다. */
export function isDarkTheme(): boolean {
  return document.documentElement.classList.contains('dark');
}

/**
 * 테마가 바뀌면 알려준다. 정리 함수를 돌려준다.
 *
 * 테마 토글이 class 를 갈아끼우는 것 말고는 알려주는 수단이 없어서 직접
 * 지켜본다. 댓글창 테마를 맞출 때와 같은 방식이다.
 */
export function watchTheme(onChange: (dark: boolean) => void): () => void {
  const observer = new MutationObserver(() => onChange(isDarkTheme()));

  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class'],
  });

  return () => observer.disconnect();
}
