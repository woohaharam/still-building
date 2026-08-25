/** 사이트 주소·이름을 한 곳에서 관리한다. RSS, sitemap, 검색 노출이 모두 이걸 쓴다. */
function resolveSiteUrl() {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/+$/, '');
  }
  // Vercel의 '대표 도메인'. 배포할 때마다 바뀌는 주소가 아니라 고정된 쪽이다.
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return 'http://localhost:3000';
}

export const siteUrl = resolveSiteUrl();

/** 헤더 로고와 저작권 줄에 쓰는 이름(워드마크). */
export const siteName = 'STILL BUILDING';

/**
 * 브라우저 탭·검색 결과·링크 미리보기에 뜨는 제목.
 * 처음 보는 사람에게는 브랜드명보다 "누구의 무엇"인지가 먼저 필요해서
 * 워드마크와 따로 둔다.
 */
export const siteTitle = '우주영의 포트폴리오';
export const siteDescription = '만들며 기록하는 개발과 일상';

/** 검색 결과에 글쓴이로 뜨는 이름 */
export const siteAuthor = '우주영';

/** 소개 페이지와 연락처에서 쓰는 값 */
export const siteAuthorAlias = 'Jack';

export const education = {
  school: '동국대학교',
  major: '컴퓨터공학전공',
  majorEnglish: 'Major in Computer Science and Engineering',
  gpa: '4.19 / 4.5',
};

/**
 * Giscus 댓글 — GitHub Discussions에 댓글을 저장한다.
 *
 * 네 값 모두 페이지 소스에 그대로 드러나는 공개 식별자라 여기 적어둔다.
 * (네이버 소유확인 코드와 같은 이유다. 환경변수를 매번 챙길 필요가 없다.)
 * 저장소를 옮기면 https://giscus.app 에서 새 값을 받아 이 네 줄만 고치면 된다.
 */
export const giscus = {
  repo: process.env.NEXT_PUBLIC_GISCUS_REPO || 'woohaharam/still-building',
  repoId: process.env.NEXT_PUBLIC_GISCUS_REPO_ID || 'R_kgDOT5ORmQ',
  category: process.env.NEXT_PUBLIC_GISCUS_CATEGORY || 'Announcements',
  categoryId:
    process.env.NEXT_PUBLIC_GISCUS_CATEGORY_ID || 'DIC_kwDOT5ORmc4DD_AO',
};

export const giscusEnabled =
  !!giscus.repo && !!giscus.repoId && !!giscus.category && !!giscus.categoryId;
export const siteEmail = 'pmypmy1234567@naver.com';
export const siteGithub = 'https://github.com/woohaharam';

/**
 * 인스타그램. 공유 주소에 붙어 오는 igsi·utm_source 같은 추적 값은
 * 떼고 계정 주소만 남겼다.
 */
export const siteInstagram = 'https://www.instagram.com/woo._.0515';
export const siteInstagramHandle = '@woo._.0515';

/**
 * 사이트 소유 확인 코드. 페이지 소스에 그대로 드러나는 공개값이라 비밀이 아니다.
 *
 * 네이버 값은 환경변수를 보지 않고 여기 적힌 걸 그대로 쓴다.
 * 예전에는 환경변수를 우선했는데, Vercel에 잘못된 값이 남아 있으면 그게 이겨서
 * 소유확인이 조용히 실패하더라고요. 바꿀 일이 생기면 이 줄만 고치면 된다.
 */
export const naverSiteVerification = '8b398efb83742312228289d6a88ea169ff8eb93d';

/** 구글은 아직 등록 전이라, 코드를 받으면 환경변수로 넣으면 돼요. */
export const googleSiteVerification =
  process.env.GOOGLE_SITE_VERIFICATION || '';

/** 한글 slug가 그대로 들어가면 안 되는 자리(RSS·sitemap·canonical)에서 써요. */
export function postUrl(slug: string) {
  return `${siteUrl}/posts/${encodeURIComponent(slug)}`;
}
