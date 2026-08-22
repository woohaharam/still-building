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

/** 검색 결과에 글쓴이로 뜨는 이름 */
export const siteAuthor = '우주영';

/** 소개 페이지와 연락처에서 쓰는 값 */
export const siteAuthorAlias = 'Jack';
export const siteEmail = 'pmypmy1234567@naver.com';
export const siteGithub = 'https://github.com/woohaharam';

/**
 * 사이트 소유 확인 코드. 페이지 소스에 그대로 드러나는 공개값이라 비밀이 아니에요.
 *
 * 네이버 값은 환경변수를 보지 않고 여기 적힌 걸 그대로 씁니다.
 * 예전에는 환경변수를 우선했는데, Vercel에 잘못된 값이 남아 있으면 그게 이겨서
 * 소유확인이 조용히 실패하더라고요. 바꿀 일이 생기면 이 줄만 고치면 돼요.
 */
export const naverSiteVerification = '8b398efb83742312228289d6a88ea169ff8eb93d';

/** 구글은 아직 등록 전이라, 코드를 받으면 환경변수로 넣으면 돼요. */
export const googleSiteVerification = process.env.GOOGLE_SITE_VERIFICATION || '';

/** 한글 slug가 그대로 들어가면 안 되는 자리(RSS·sitemap·canonical)에서 써요. */
export function postUrl(slug: string) {
  return `${siteUrl}/posts/${encodeURIComponent(slug)}`;
}
