/** 사이트 주소·이름을 한 곳에서 관리해요. RSS, sitemap, 검색 노출이 모두 이걸 씁니다. */
function resolveSiteUrl() {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/+$/, '');
  }
  // Vercel의 '대표 도메인'. 배포할 때마다 바뀌는 주소가 아니라 고정된 쪽이에요.
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return 'http://localhost:3000';
}

export const siteUrl = resolveSiteUrl();

export const siteName = 'STILL BUILDING';
export const siteDescription = '만들며 기록하는 개발과 일상';

/** 검색 결과에 글쓴이로 뜨는 이름. 본인 이름이나 닉네임으로 바꿔도 돼요. */
export const siteAuthor = 'STILL BUILDING';

/**
 * 사이트 소유 확인 코드.
 * 페이지 소스에 그대로 드러나는 공개값이라 비밀이 아니에요. 그래서 네이버 코드는
 * 여기 적어둡니다 — 배포할 때마다 환경변수를 챙길 필요가 없게요.
 * 환경변수를 넣으면 그쪽이 우선이고, 구글은 아직 등록 전이라 비워뒀어요.
 */
export const googleSiteVerification = process.env.GOOGLE_SITE_VERIFICATION || '';
export const naverSiteVerification =
  process.env.NAVER_SITE_VERIFICATION ||
  '8b398efb83742312228289d6a88ea169ff8eb93d';

/** 한글 slug가 그대로 들어가면 안 되는 자리(RSS·sitemap·canonical)에서 써요. */
export function postUrl(slug: string) {
  return `${siteUrl}/posts/${encodeURIComponent(slug)}`;
}
