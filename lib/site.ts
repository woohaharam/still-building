/** 사이트 주소·이름을 한 곳에서 관리해요. RSS, sitemap, 미리보기 이미지가 모두 이걸 씁니다. */
export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : 'http://localhost:3000');

export const siteName = 'STILL BUILDING';
export const siteDescription = '만들며 기록하는 개발과 일상';

/** 한글 slug가 그대로 들어가면 안 되는 자리(RSS·sitemap)에서 써요. */
export function postUrl(slug: string) {
  return `${siteUrl}/posts/${encodeURIComponent(slug)}`;
}
