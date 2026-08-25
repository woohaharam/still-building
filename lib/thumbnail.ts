/**
 * 목록에 걸 대표 이미지.
 *
 * 커버 이미지를 따로 지정했으면 그걸 쓰고, 없으면 본문 첫 번째 이미지를 가져온다.
 * 사진을 넣고도 커버 지정을 깜빡하는 경우가 대부분이라 자동으로 찾아준다.
 */

/** ![설명](주소) 또는 ![설명](주소 "크기") 에서 주소만. */
const IMAGE =
  /!\[[^\]]*\]\(\s*(<[^>]*>|[^()\s]+)(?:\s+(?:"[^"]*"|'[^']*'|\([^)]*\)))?\s*\)/;

/** 코드 블록 안의 이미지는 예시일 뿐이라 대표 이미지로 쓰지 않는다. */
function stripCodeBlocks(markdown: string) {
  return markdown.replace(/```[\s\S]*?```/g, '').replace(/`[^`\n]*`/g, '');
}

export function firstImage(markdown: string): string | null {
  const match = stripCodeBlocks(markdown).match(IMAGE);
  if (!match) return null;

  // <주소> 꼴로 감싼 경우 꺾쇠를 벗긴다.
  const url = match[1].replace(/^<|>$/g, '').trim();

  // data: 는 목록에 걸기엔 너무 무겁고, 그 외 http(s)와 사이트 내부 경로만 받는다.
  if (/^https?:\/\//.test(url) || url.startsWith('/')) return url;
  return null;
}

export function thumbnailOf(post: {
  cover_image_url: string | null;
  content: string;
}): string | null {
  return post.cover_image_url || firstImage(post.content);
}
