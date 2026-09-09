/** 문제 → 원인 → 시도 → 해결 → 성과. 포트폴리오에서 제일 많이 읽히는 부분이다. */
export interface Trouble {
  title: string;
  problem: string;
  cause: string;
  tried: string;
  solution: string;
  /** 가능하면 숫자로. "빨라졌다"보다 "96 → 100"이 낫다. */
  result: string;
}

/** 구조도 한 칸. columns가 왼쪽에서 오른쪽으로 이어진다. */
export interface ArchitectureColumn {
  title: string;
  items: string[];
}

export interface Architecture {
  caption: string;
  columns: ArchitectureColumn[];
  /** 화살표로 그리기 애매한 흐름은 문장으로. */
  flows: string[];
}

export interface Feature {
  title: string;
  body: string;
}

export interface Project {
  slug: string;
  title: string;
  period: string;
  role: string;
  summary: string;
  stack: string[];
  links: { label: string; href: string }[];

  /** 개발 인원. 비워두면 화면에서 빠진다. */
  team?: string;
  /** 본인 기여도. 퍼센트든 맡은 범위든. */
  contribution?: string;
  /** 면접관이 직접 눌러볼 수 있는 라이브 주소. */
  deployUrl?: string;

  /** 목록과 상세 맨 위에 숫자로 보여줄 성과. */
  impact?: string[];
  /** 직접 설계·구현한 기능. */
  features?: Feature[];
  architecture?: Architecture;
  troubles?: Trouble[];
}

/**
 * 프로젝트를 추가하려면 여기에 항목을 하나 더 넣으면 된다.
 * 목록(/projects), 상세(/projects/[slug]), 메인의 개수 표시가 모두 이 배열을 따라간다.
 * team·contribution·impact·features·architecture·troubles는 선택이고,
 * 없으면 그 자리만 화면에서 빠진다. 최근에 한 것부터 위로.
 */
export const PROJECTS: Project[] = [
  {
    slug: 'still-building',
    title: 'STILL BUILDING',
    period: '2026.08 —',
    role: '개인 프로젝트 · 기획부터 배포까지',
    team: '1명',
    contribution: '100%',
    deployUrl: 'https://mynameiswoo.vercel.app',
    summary:
      '글 쓰는 곳과 일정 보는 곳이 따로 노는 게 싫어서 하나로 합쳤다. 지금 보고 있는 사이트다.',
    stack: [
      'Next.js 14 (App Router)',
      'TypeScript',
      'Tailwind CSS',
      'Supabase (Postgres · Auth · Storage)',
      'Vercel',
      'Vitest',
      'GitHub Actions',
    ],
    impact: [
      'Lighthouse 접근성 96 → 100점. 대비 미달로 잡히던 요소 3종 → 0',
      '첫 로드 공통 JS 87.3 kB, Lighthouse 성능 92 ~ 100점 (로컬 프로덕션 빌드 기준)',
      '순수 함수 테스트 268개. PR마다 포맷·린트·타입·테스트·빌드 5단계 자동 실행',
      '588줄까지 불어난 관리자 페이지를 세 파일로 분리. 편집기 다섯 개가 목록·저장 로직과 목록 UI 를 공유한다',
    ],
    architecture: {
      caption:
        '방문자는 서버에서 그려진 HTML을 받는다. 쓰기는 로그인한 나만 된다. 그 검사를 브라우저가 아니라 DB가 한다.',
      columns: [
        {
          title: '브라우저',
          items: [
            '방문자 — 글·달력·프로젝트',
            '관리자 /admin — 글·일정 작성',
            'localStorage — 테마, 음악 상태',
          ],
        },
        {
          title: 'Vercel (Next.js)',
          items: [
            '서버 컴포넌트 렌더링',
            'sitemap · robots · RSS 생성',
            'OG 이미지 (next/og)',
            '보안 헤더 · CSP',
          ],
        },
        {
          title: 'Supabase',
          items: [
            'Postgres — posts, events',
            'RLS — is_owner() 정책',
            'Auth — 이메일 로그인',
            'Storage — 본문 이미지',
          ],
        },
        {
          title: '외부',
          items: [
            'GitHub Discussions — 댓글(giscus)',
            'YouTube IFrame API — 배경음악',
            'GitHub Actions — CI',
          ],
        },
      ],
      flows: [
        '읽기 — 방문자 → Vercel 서버 렌더 → Supabase에서 published = true 인 글만 조회 → HTML 응답',
        '쓰기 — /admin 로그인 → Auth 세션 → INSERT/UPDATE → RLS가 is_owner() 검사 → 통과한 것만 반영',
        '검색 — sitemap.xml · feed.xml · JSON-LD 생성 → 구글·네이버 크롤러',
      ],
    },
    features: [
      {
        title: '마크다운 관리자 + 임시저장 미리보기',
        body: '발행 여부와 발행일을 직접 고른다. 임시저장 글은 /admin/preview/[slug]에서 실제 글 화면 그대로 보이고, 로그인한 사람에게만 열린다. 공개 화면과 미리보기가 PostArticle 하나를 같이 쓴다. 미리보기 전용 컴포넌트를 따로 두면 언젠가 둘이 어긋나기 때문이다.',
      },
      {
        title: '일정 + 글 쓴 날을 겹쳐 보는 달력',
        body: '등록한 일정(일정·마감·메모)과 글 쓴 날을 한 화면에 겹쳐 보여준다. 날짜를 누르면 그날 내용이 아래에 펼쳐지고 글 제목을 누르면 글로 간다. 달·주 계산은 lib/calendar.ts 순수 함수로 빼뒀다. 여기서 시간대 문제를 만났다.',
      },
      {
        title: '검색 노출 (sitemap · RSS · 구조화 데이터 · OG 이미지)',
        body: 'sitemap.xml · robots.txt · RSS · BlogPosting JSON-LD를 코드로 만들고 네이버 서치어드바이저에 등록했다. 글마다 제목이 박힌 OG 이미지는 next/og로 그린다. satori가 woff2를 못 읽어서 트루타입을 쓰고, 한글 폰트를 통째로 받으면 너무 크니까 제목에 실제로 쓰인 글자만 서브셋으로 요청한다.',
      },
      {
        title: '본문 목차 · 코드 복사 · 읽기 진행 바 · 공유',
        body: '제목이 3개 이상이면 접이식 목차가 붙는다. 목차 id는 rehype-slug가 쓰는 github-slugger를 그대로 가져다 쓴다. 규칙을 직접 흉내 내면 언젠가 어긋난다. 코드 블록에는 언어 표시와 복사 버튼, 글 위에는 읽기 진행 바, 글 끝에는 공유 버튼.',
      },
      {
        title: '다녀온 곳에 핀을 찍는 여행 지도',
        body: '핀을 누르면 그 여행기로 간다. 처음에는 나라 윤곽선을 미리 SVG 로 구워 그렸다. 밖으로 나가는 요청이 없고 자바스크립트 없이도 보인다는 게 좋았는데, 정작 좌표를 고르는 관리자 화면에서 지명도 길도 없으니 어디를 누르는지 알 수가 없었다. 그래서 실제 타일 지도로 갈았다. 타일은 밝고 어두운 판이 다 있는 것을 골라 사이트 테마를 따라가게 했고, 테마가 바뀌는 건 <html> 의 class 를 지켜봐서 안다. 지도가 못 떠도 그 아래 목록에 여행이 전부 있어서 읽는 데는 지장이 없다. 바꾸면서 쓰지 않게 된 투영 코드와 48KB 짜리 윤곽선 데이터를 지웠다. 나라별 중심점만 남겼는데, 좌표를 적지 않은 여행이 거기 찍힌다.',
      },
      {
        title: '사이트 데이터로 만드는 이력서',
        body: '지원서에 첨부하는 건 결국 PDF 한 장인데, 이력서를 문서로 따로 관리하면 프로젝트가 늘 때마다 두 군데를 고쳐야 하고 결국 한쪽이 뒤처진다. /resume 이 프로젝트·논문·활동 데이터를 그대로 읽어 한 장으로 만들고, 브라우저의 인쇄가 그대로 제출용 PDF 가 된다. 화면과 PDF 가 같은 코드를 쓰므로 둘이 어긋날 자리가 없다. 어두운 테마로 보다 인쇄해도 종이는 희게 나오고, 헤더와 버튼은 빠진다.',
      },
      {
        title: '테마 · 배경음악 · 댓글',
        body: '다크 모드는 CSS 변수만 갈아끼운다. 색 정의가 globals.css 한 곳에 모여 있어서 팔레트를 통째로 바꿔도 세 줄이면 된다. 첫 화면이 하얗게 번쩍이는 걸 막으려고 React가 붙기 전에 인라인 스크립트로 테마를 먼저 정한다. 배경음악은 YouTube IFrame API, 댓글은 giscus. 둘 다 사이트 테마를 따라온다.',
      },
    ],
    troubles: [
      {
        title: '관리자 인증이 브라우저 안에만 있었다',
        problem:
          '관리자 페이지가 비밀번호를 자바스크립트로 검사하고 있었다. 개발자 도구를 열어 조건을 통과시키면 그냥 들어가진다. 그 아래 DB 정책은 "누구나 쓰기 가능"이었다.',
        cause:
          '인증을 화면에서만 했다. 브라우저에서 도는 검사는 잠금이 아니라 가림막이다.',
        tried:
          '비밀번호를 환경변수로 옮겨봤다. NEXT_PUBLIC_ 으로 시작하는 값은 빌드 결과물에 그대로 박힌다. 소스만 열면 보였다.',
        solution:
          'Supabase Auth 이메일 로그인으로 바꾸고 Postgres RLS에 is_owner() 함수를 만들어 쓰기 정책을 걸었다. 권한 검사가 브라우저에서 DB로 내려갔다.',
        result:
          '글·일정 테이블의 "누구나 쓰기" 정책 제거. 로그인한 소유자만 INSERT·UPDATE·DELETE가 통과한다. 프론트엔드 코드를 아무리 고쳐도 우회되지 않는다.',
      },
      {
        title: '달력에서 날짜가 하루씩 밀렸다',
        problem:
          '8월 19일에 쓴 글이 달력에서 18일 칸에 찍혔다. 등록한 일정도 하루씩 앞으로 밀렸다.',
        cause:
          "new Date('2026-08-19') 처럼 시각이 없는 ISO 문자열은 UTC 자정으로 해석된다. UTC+9에서 읽으면 전날 오후 3시다.",
        tried:
          'toISOString().slice(0, 10) 으로 날짜 키를 만들어봤다. 이것도 UTC로 되돌리는 동작이라 그대로 밀렸다.',
        solution:
          "문자열을 '-'로 잘라 연·월·일을 꺼내고 new Date(y, m - 1, d)로 로컬 날짜를 만든다(parseDateKey). 반대 방향도 로컬 기준. UTC를 아예 거치지 않는다.",
        result:
          '날짜 계산을 lib/calendar.ts 순수 함수로 분리하고 테스트 13개를 붙였다. 다시 밀리면 CI에서 걸린다.',
      },
      {
        title: 'DB 장애가 "쓴 글이 없음"으로 보였다',
        problem:
          '글이 4편 있는데 목록에 "아직 작성된 글이 없어요"가 떴다. 방문자는 장애인지 내가 안 쓴 건지 알 방법이 없다.',
        cause:
          'getPublishedPosts가 조회 실패를 try/catch로 삼키고 빈 배열을 돌려줬다. 실패와 0건이 같은 값이 된다.',
        tried:
          '실패할 때 콘솔에 로그를 남겼다. 서버 로그는 방문자가 볼 수 없으니 화면은 그대로였다.',
        solution:
          '조회 실패는 throw 하고 app/error.tsx가 받아 다시 시도 버튼을 띄운다. 글 상세는 .maybeSingle()로 바꿔 "없는 글"과 "조회 실패"를 갈랐다.',
        result:
          '장애는 500 + 재시도 화면, 0편은 안내 문구, 없는 주소는 404. 세 경우가 각각 다른 화면이 된다.',
      },
      {
        title: '테스트를 쓰다가 찾은 유튜브 주소 파싱 버그',
        problem:
          '배경음악 목록에 유튜브가 아닌 주소를 넣어도 플레이어가 만들어졌다. 로딩만 계속되고 다음 곡으로 넘어가지도 않는다.',
        cause:
          'youtubeId가 정규식으로 ?v= 뒤만 잘라냈다. 호스트는 보지 않는다.',
        tried:
          '정규식에 youtube를 넣어봤다. 쿼리스트링에 youtube가 들어간 남의 사이트 주소가 여전히 통과했다.',
        solution:
          'new URL()로 파싱해 호스트를 화이트리스트로 검사한다. watch?v= · youtu.be · shorts 세 형태를 따로 처리.',
        result:
          '테스트를 쓰다가 나온 버그다. 지금은 파싱 테스트 10개가 이 함수를 붙잡고 있다.',
      },
      {
        title: '다크 모드로 바꿔도 댓글창만 밝게 남았다',
        problem:
          '테마를 어둡게 해도 giscus 댓글창만 밝은 채였다. 테마를 전달하는 코드를 넣었는데 반응이 없었다.',
        cause:
          'Strict Mode는 effect를 두 번 실행한다. 스크립트가 이미 있으면 곧바로 return 하게 짜둔 탓에, 1회차에 붙인 MutationObserver가 cleanup에서 끊기고 2회차는 early return에 걸려 다시 붙지 않았다.',
        tried:
          '주입 여부 플래그를 따로 뒀다. early return 위치가 그대로라 증상도 그대로였다.',
        solution:
          'early return의 범위를 스크립트 주입에만 남기고, 옵저버 등록은 매번 실행되게 분리했다.',
        result:
          '테마를 토글하면 giscus 프레임으로 dark_dimmed 가 간다. Strict Mode가 왜 두 번 도는지는 이때 찾아봤다.',
      },
      {
        title: '태평양에 찍힌 러시아, 아프리카에 찍힌 피지',
        problem:
          '좌표를 적지 않은 여행은 나라 중심점에 핀을 찍는다. 그 중심점을 계산했더니 러시아가 경도 202도, 피지가 11도로 나왔다. 202도는 애초에 존재하지 않는 좌표고, 11도는 아프리카다. 같은 자료로 그린 세계 지도에는 왼쪽 끝에서 오른쪽 끝까지 가느다란 줄이 하나 그어졌다.',
        cause:
          '둘 다 날짜변경선 때문이었다. 180도를 넘나드는 나라는 좌표가 180에서 -180으로 튄다. 그대로 평균을 내면 중심점이 지구 반대편으로 가고, 그 두 점을 직선으로 이으면 지도를 가로지르는 줄이 된다.',
        tried:
          '튀는 구간에서 선을 끊어봤다. 줄은 사라졌는데 그 나라만 반쪽이 뜯긴 채 남았다. 중심점은 그대로 틀린 자리였다.',
        solution:
          '앞 점과의 차이가 180도를 넘으면 한 바퀴를 더하거나 빼서 좌표를 이어붙인다. 그 상태로 계산하고 결과만 -180~180 안으로 되돌린다. 윤곽선 쪽은 화면에 걸치는 만큼 한 바퀴씩 옮겨 여러 번 그려서 양쪽 가장자리에 나뉘어 나오게 했다.',
        result:
          '러시아 99.9도, 피지 178도로 제자리를 찾았다. 중심점 174개가 전부 지구 안에 있는지 검사하는 테스트를 붙였고, 이 문제는 화면을 보기 전에 그 테스트가 먼저 잡았다. 나중에 지도를 타일로 갈면서 윤곽선 코드는 지웠지만 중심점은 그대로 쓴다.',
      },
      {
        title: '본문 글자 색이 접근성 기준에 못 미쳤다',
        problem:
          'Lighthouse 접근성 96점. 날짜·태그·설명에 쓰던 흐린 회색이 대비 부족으로 잡혔다.',
        cause:
          '--ink-muted 를 눈으로만 정했다. 실측 대비가 3.1:1. WCAG AA 본문 기준은 4.5:1이다.',
        tried:
          '글자를 키우면 큰 글자 기준(3:1)으로 통과한다. 흐린 보조 정보가 커지면서 화면 위계가 무너져서 접었다.',
        solution:
          '색만 옮겼다. --ink-muted 4.7:1, 강조색 4.8:1. 다크 모드 값도 같이 맞췄다. 색이 CSS 변수 한 곳에 모여 있어서 세 줄 수정으로 끝났다.',
        result:
          '접근성 96 → 100. 대비 미달 요소 3종 → 0. 같은 김에 폰트 @import 를 head의 link + preconnect 로 옮겨 요청 왕복을 하나 줄였다. 다만 이때는 배경 하나만 보고 맞춘 것이었다.',
      },
      {
        title: '눈으로 고친 대비가 카드 위에서는 여전히 미달이었다',
        problem:
          '접근성을 100점으로 올려두고 한참 뒤에 전 페이지를 훑었더니, 복무 기록 화면에서 흐린 글자 일곱 곳이 다시 기준 미달로 잡혔다.',
        cause:
          '색을 종이 배경(--paper) 하나만 기준으로 맞췄기 때문이다. 카드 배경(--surface)은 글자와 더 가까워서 같은 색이 4.61 에서 4.23:1 로 떨어진다. 화면으로는 구분이 안 되는 차이다.',
        tried:
          '눈으로는 못 찾는 문제라 찾은 방법이 해결의 일부였다. 헤드리스 브라우저에 axe-core 를 넣어 11개 페이지를 라이트와 다크 양쪽으로 한 번에 훑었다.',
        solution:
          '기준을 더 빡빡한 --surface 로 바꿔 색을 다시 계산했다. 같은 검사에서 달력의 지난달·다음달 날짜가 대비 1.9:1 인 것도 나왔다. 흐리게 보이는 것과 못 읽는 것은 다르다. 칸 전체를 누르던 opacity 를 걷고 글자는 읽히는 색으로 올린 뒤 배경만 옅게 남겼다.',
        result:
          '11개 페이지 × 두 테마에서 위반 0. 앞서 100점을 받은 건 Lighthouse 가 검사한 두 페이지만 통과한 것이었다는 걸 이때 알았다.',
      },
    ],
    links: [
      { label: '사이트 열기', href: 'https://mynameiswoo.vercel.app' },
      { label: '저장소', href: 'https://github.com/woohaharam/still-building' },
      { label: '블로그 글', href: '/blog' },
    ],
  },
  {
    slug: 'tripplai',
    title: 'Tripplai',
    period: '2025.03 — 2025.05',
    role: '팀 프로젝트 · 프론트엔드',
    contribution:
      '축제 페이지(달력·목록·키워드 검색)와 리뷰 화면(목록·상세·작성)',
    summary:
      '목적지와 일정만 넣으면 AI가 여행 코스를 짜주는 서비스. 팀으로 만들었고 나는 축제 페이지와 리뷰 화면을 맡았다.',
    stack: [
      'Next.js 15',
      'TypeScript',
      'Tailwind CSS',
      'React Query',
      'NextAuth.js',
    ],
    features: [
      {
        title: '축제 정보를 달력과 목록 두 가지로',
        body: '언제 열리는지가 궁금한 사람과 뭐가 있는지가 궁금한 사람은 필요한 화면이 다르다. 같은 데이터를 달력과 목록 두 방식으로 볼 수 있게 만들었다.',
      },
      {
        title: '축제 달력·목록 키워드 검색',
        body: '달력과 목록 양쪽에 같은 검색을 붙였다. 지역 이름으로도 축제 이름으로도 걸려야 해서, 실제 일은 검색 대상을 어디까지 볼지 정하는 쪽이었다.',
      },
      {
        title: '리뷰 화면과 스타일 통일',
        body: '리뷰 목록·상세·작성 버튼 화면을 만들었다. 사람마다 다르게 쌓여 있던 스타일도 이때 하나로 맞췄다.',
      },
    ],
    troubles: [],
    links: [{ label: '저장소', href: 'https://github.com/Tripplai/client' }],
  },
  {
    slug: 'yojeumgeosdeul',
    title: '요즘것들',
    period: '2024.11',
    role: '팀장 · 프론트엔드',
    team: '4명 (우주영 · 허예진 · 박지성 · 오원준)',
    contribution: '팀 리딩과 프론트엔드 전반',
    summary:
      '2024 경주 지역문제 해결 해커톤에 「요즘것들」 팀으로 나가 만든 것. 창업하려는 청년에게 맞는 정책을 추천하고, 지역의 빈 점포를 공유오피스처럼 빌려 쓰게 하는 서비스다. 저장소와 발표 자료에는 서비스 이름인 OPEN WAY로 적혀 있다.',
    stack: ['HTML', 'CSS', 'JavaScript'],
    architecture: {
      caption:
        '백엔드 없이 화면과 브라우저 안에서 도는 흐름이다. 정책 추천과 지도, 예약이 각각 따로 놀지 않고 마지막에 달력 하나로 모이게 짰다.',
      columns: [
        {
          title: '홈',
          items: ['AI 정책 추천 버튼', '예약이 찍히는 달력'],
        },
        {
          title: '정책',
          items: ['추천 정책 목록', '누르면 정책 원문으로'],
        },
        {
          title: '지도',
          items: ['GPS 기반 빈 점포 지도', '지역 검색 → 주변 점포 정보'],
        },
        {
          title: '예약',
          items: ['점포 예약', '완료하면 홈 달력에 자동 입력'],
        },
      ],
      flows: [
        '정책 — 홈에서 버튼 → AI가 추천한 정책 목록 → 마음에 드는 정책 → 원문 링크',
        '점포 — 지도에서 지역 검색 → 주변 빈 점포 정보 → 예약 → 홈 달력에 자동 표시',
      ],
    },
    features: [
      {
        title: 'AI 창업 정책 추천',
        body: '홈에서 AI가 추천한 창업 지원 정책을 바로 보고, 누르면 정책 원문으로 넘어간다.',
      },
      {
        title: 'GPS 기반 빈 점포 지도와 예약',
        body: '지도에 지역의 빈 점포를 띄웠다. 지역을 검색하면 주변 점포가 나오고 거기서 바로 예약까지 이어진다.',
      },
      {
        title: '예약이 자동으로 찍히는 달력',
        body: '예약을 마치면 메인 달력에 자동으로 찍힌다. 프레임워크 없이 HTML·CSS·JS만 썼기 때문에 요일 계산도 화면 전환도 전부 손으로 짰다. 달력을 직접 그려본 건 이때가 처음이다.',
      },
    ],
    troubles: [],
    links: [
      {
        label: '저장소',
        href: 'https://github.com/woohaharam/2024hackathon_yojeumgeosdeul',
      },
    ],
  },
];

export function getProject(slug: string) {
  return PROJECTS.find((p) => p.slug === slug);
}
