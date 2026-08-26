/** 마크다운 문법을 걷어내고 사람이 읽는 글자만 남긴다. */
export function stripMarkdown(markdown: string): string {
  return (
    markdown
      .replace(/```[\s\S]*?```/g, ' ')
      .replace(/`[^`]*`/g, ' ')
      .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
      .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
      .replace(/^\s{0,3}#{1,6}\s+/gm, '')
      .replace(/^\s{0,3}>\s?/gm, '')
      // 표 구분선(|---|---|)이나 구분선(---)처럼 글자가 아닌 줄은 통째로 버린다.
      .replace(/^[-:|\s]{3,}$/gm, ' ')
      .replace(/^\s{0,3}[-*+]\s+/gm, '')
      .replace(/[*_~|]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
  );
}

/**
 * 검색 결과에 한 줄로 뜨는 설명.
 * 요약을 안 적어둔 글은 본문 앞부분을 잘라서 써요 — 설명이 비면 구글이
 * 아무 문장이나 골라서 보여주기 때문이다.
 */
export function metaDescription(
  source: { excerpt?: string | null; content: string },
  max = 160
): string {
  const excerpt = source.excerpt?.trim();
  if (excerpt) return excerpt;

  const text = stripMarkdown(source.content);
  return text.length > max ? `${text.slice(0, max).trimEnd()}…` : text;
}
