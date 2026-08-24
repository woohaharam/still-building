/**
 * 미리보기 이미지에 한글을 그리려면 그 글자가 든 폰트가 필요하다.
 * 구글 폰트에 "이 글자들만" 달라고 하면 수십 KB짜리 조각만 내려와서,
 * 한글 폰트 전체(수 MB)를 저장소에 넣지 않아도 됩니다.
 */
export async function loadKoreanFont(
  text: string
): Promise<ArrayBuffer | null> {
  try {
    const cssUrl =
      'https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@700&text=' +
      encodeURIComponent(text);

    const css = await fetch(cssUrl).then((res) => res.text());

    // 브라우저가 아닌 요청에는 woff2 대신 truetype을 주는데, satori가 읽는 건 그쪽이다.
    const fontUrl = css.match(
      /src:\s*url\((https:\/\/[^)]+)\)\s*format\('truetype'\)/
    )?.[1];
    if (!fontUrl) return null;

    const res = await fetch(fontUrl);
    if (!res.ok) return null;

    return await res.arrayBuffer();
  } catch {
    // 폰트를 못 받아와도 이미지 생성이 실패하면 안 되니까 조용히 넘어간다.
    return null;
  }
}
