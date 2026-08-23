/** 문제 → 원인 → 시도 → 해결 → 성과. 포트폴리오에서 제일 많이 읽히는 부분이에요. */
export interface Trouble {
  title: string;
  problem: string;
  cause: string;
  tried: string;
  solution: string;
  /** 가능하면 숫자로. "빨라졌어요"보다 "96 → 100"이 설득력이 있어요. */
  result: string;
}

/** 구조도 한 칸. columns가 왼쪽에서 오른쪽으로 이어집니다. */
export interface ArchitectureColumn {
  title: string;
  items: string[];
}

export interface Architecture {
  caption: string;
  columns: ArchitectureColumn[];
  /** 화살표로 그리기 애매한 데이터 흐름은 문장으로 적어요. */
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

  /** 개발 인원. 모르면 비워두면 화면에서 빠집니다. */
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
 * 프로젝트를 추가하려면 여기에 항목을 하나 더 넣으면 돼요.
 * 목록(/projects), 상세(/projects/[slug]), 메인의 개수 표시가 모두 이 배열을 따라갑니다.
 * team·contribution·impact·features·architecture·troubles는 선택이고,
 * 없으면 그 자리만 화면에서 빠집니다. 최근에 한 것부터 위로.
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
      '글쓰기와 일정을 한 곳에서 관리하려고 직접 만든 개인 블로그 겸 포트폴리오. 지금 보고 계신 사이트예요.',
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
      'Lighthouse 접근성 96 → 100점 (대비 미달 요소 3종 → 0)',
      '첫 로드 공통 JS 87.3 kB, 성능 92 ~ 100점',
      '순수 함수 테스트 56개 · PR마다 5단계 자동 검사',
      '588줄짜리 관리자 페이지를 78 / 70 / 450줄 세 파일로 분리',
    ],
    architecture: {
      caption:
        '방문자는 서버에서 그려진 HTML을 받고, 글을 쓰는 건 로그인한 나뿐이에요. 권한 검사는 브라우저가 아니라 데이터베이스가 합니다.',
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
        '읽기: 방문자 → Vercel 서버 렌더 → Supabase에서 published=true 인 글만 조회 → HTML 응답',
        '쓰기: /admin 로그인 → Supabase Auth 세션 → INSERT/UPDATE 요청 → RLS가 is_owner() 검사 → 통과한 것만 반영',
        '검색: 빌드·요청 시 sitemap.xml · feed.xml · JSON-LD 생성 → 구글·네이버 크롤러',
      ],
    },
    features: [
      {
        title: '마크다운 관리자 + 임시저장 미리보기',
        body: '글을 쓰고 발행 여부와 발행일을 직접 정할 수 있어요. 임시저장 글은 /admin/preview/[slug]에서 실제 글 화면 그대로 볼 수 있고, 로그인한 사람에게만 보입니다. 공개 화면과 미리보기가 PostArticle 하나를 같이 써서 "미리보기와 실제가 다른" 문제가 생기지 않게 했어요.',
      },
      {
        title: '일정 + 글 쓴 날을 겹쳐 보는 달력',
        body: '직접 등록한 일정(일정·마감·메모)과 글을 발행한 날을 한 달력에 함께 표시해요. 날짜를 누르면 그날 내용이 아래에 펼쳐지고, 글 제목을 누르면 글로 이동합니다. 달·주 계산은 lib/calendar.ts의 순수 함수로 빼서 테스트를 붙였어요.',
      },
      {
        title: '검색 노출 (sitemap · RSS · 구조화 데이터 · OG 이미지)',
        body: 'sitemap.xml, robots.txt, RSS 피드, BlogPosting JSON-LD를 코드로 생성하고 네이버 서치어드바이저에 등록했어요. 글마다 제목이 박힌 OG 이미지를 next/og로 만드는데, satori가 woff2를 못 읽어서 트루타입을 쓰고 제목 글자만 서브셋으로 받아옵니다.',
      },
      {
        title: '본문 목차 · 코드 복사 · 읽기 진행 바 · 공유',
        body: '제목이 3개 이상인 글에는 접이식 목차가 붙어요. 목차 id는 rehype-slug가 쓰는 github-slugger를 그대로 써서 본문과 항상 같은 값이 나오게 했습니다. 코드 블록에는 언어 표시와 복사 버튼, 글 위에는 읽기 진행 바, 글 끝에는 링크 복사·공유 버튼이 있어요.',
      },
      {
        title: '테마 · 배경음악 · 댓글',
        body: '다크 모드는 CSS 변수만 갈아끼우는 방식이라 색 정의가 globals.css 한 곳에 모여 있어요. 첫 화면이 하얗게 번쩍이지 않도록 React가 붙기 전에 인라인 스크립트로 테마를 정합니다. 배경음악은 YouTube IFrame API, 댓글은 giscus를 쓰고 둘 다 사이트 테마를 따라가요.',
      },
    ],
    troubles: [
      {
        title: '관리자 인증이 브라우저 안에만 있었다',
        problem:
          '관리자 페이지가 비밀번호를 자바스크립트로 검사하고 있었어요. 개발자 도구로 조건을 통과시키면 그대로 들어갈 수 있었고, 그 아래 데이터베이스 정책은 "누구나 쓰기 가능"이었습니다.',
        cause:
          '인증을 화면 단에서만 했고, 실제 데이터에는 아무 제한이 없었어요. 브라우저에서 하는 검사는 잠금이 아니라 가림막이라는 걸 몰랐습니다.',
        tried:
          '비밀번호를 환경변수로 옮겨봤지만 NEXT_PUBLIC_ 으로 시작하는 값은 빌드 결과물에 그대로 박혀서 소스만 열어보면 보였어요.',
        solution:
          'Supabase Auth 이메일 로그인으로 바꾸고, Postgres Row Level Security에 is_owner() 함수를 만들어 쓰기 정책을 걸었습니다. 이제 권한 검사를 브라우저가 아니라 DB가 합니다.',
        result:
          '글·일정 테이블의 "누구나 쓰기" 정책이 걷히고, 로그인한 소유자만 INSERT·UPDATE·DELETE가 통과해요. 프론트엔드 코드를 아무리 고쳐도 우회되지 않습니다.',
      },
      {
        title: '달력에서 날짜가 하루씩 밀렸다',
        problem:
          '8월 19일에 쓴 글이 달력에서는 8월 18일 칸에 찍혔어요. 등록한 일정도 하루 앞으로 밀려 보였습니다.',
        cause:
          "new Date('2026-08-19') 처럼 시각이 없는 ISO 문자열을 자바스크립트는 UTC 자정으로 해석해요. 한국(UTC+9)에서 읽으면 전날 오후 3시가 됩니다.",
        tried:
          'toISOString().slice(0, 10) 으로 날짜 키를 만들어봤지만, 이건 다시 UTC로 되돌리는 것이라 같은 이유로 계속 밀렸어요.',
        solution:
          "문자열을 '-'로 직접 잘라 연·월·일을 꺼낸 뒤 new Date(y, m - 1, d)로 로컬 날짜를 만드는 parseDateKey를 두고, 반대 방향(toDateKey)도 로컬 기준으로 포맷하게 했습니다. UTC를 아예 거치지 않아요.",
        result:
          '날짜 계산을 lib/calendar.ts 순수 함수로 분리하고 테스트 13개를 붙였어요. 시간대 때문에 다시 밀리면 CI에서 바로 걸립니다.',
      },
      {
        title: 'DB 장애가 "쓴 글이 없음"으로 보였다',
        problem:
          '글이 4편 있는데도 목록에 "아직 작성된 글이 없어요"가 떴어요. 방문자 입장에서는 장애가 난 건지 글을 안 쓴 건지 알 수 없었습니다.',
        cause:
          'getPublishedPosts가 조회 실패를 try/catch로 삼키고 빈 배열을 돌려주고 있었어요. 실패와 "결과가 0건"이 같은 값으로 합쳐진 겁니다.',
        tried:
          '실패할 때 콘솔에 로그를 남겨봤지만, 서버 로그는 방문자에게 보이지 않아서 화면은 그대로였어요.',
        solution:
          '조회 실패는 에러를 던지게 하고 app/error.tsx가 받아 다시 시도 버튼을 보여주게 했어요. 글 상세는 .maybeSingle()로 바꿔 "없는 글"과 "조회 실패"를 갈랐습니다.',
        result:
          '장애(500 + 재시도 화면), 글 0편(안내 문구), 없는 주소(404) 세 가지가 각각 다른 화면으로 구분돼요.',
      },
      {
        title: '테스트를 쓰다가 찾은 유튜브 주소 파싱 버그',
        problem:
          '배경음악 목록에 유튜브가 아닌 주소를 넣어도 플레이어가 만들어지고, 영원히 로딩만 되면서 다음 곡으로 넘어가지도 않았어요.',
        cause:
          'youtubeId가 정규식으로 ?v= 뒤만 잘라내고 호스트는 확인하지 않았어요. 그래서 아무 사이트 주소나 통과했습니다.',
        tried:
          '정규식에 youtube 라는 글자를 넣어봤지만, 쿼리스트링에 youtube가 들어간 다른 사이트 주소가 여전히 통과했어요.',
        solution:
          'new URL()로 주소를 파싱해 호스트를 화이트리스트로 검사하고, watch?v= · youtu.be · shorts 세 형태를 각각 처리하도록 다시 썼습니다.',
        result:
          '테스트를 쓰는 중에 발견한 버그였어요. 지금은 파싱 테스트 10개가 이 함수를 붙잡고 있습니다.',
      },
      {
        title: '다크 모드로 바꿔도 댓글창만 밝게 남았다',
        problem:
          '테마를 어둡게 해도 giscus 댓글창은 밝은 채였어요. 테마를 전달하는 코드를 넣었는데도 아무 반응이 없었습니다.',
        cause:
          'React 개발 모드(Strict Mode)는 effect를 두 번 실행해요. 스크립트가 이미 붙어 있으면 곧바로 return 하도록 짜둔 탓에, 첫 번째 실행에서 붙인 MutationObserver가 정리 단계에서 끊기고 두 번째 실행에서는 early return에 걸려 다시 붙지 않았습니다.',
        tried:
          '스크립트를 넣었는지 표시하는 플래그를 따로 뒀지만, early return 위치가 그대로여서 증상도 그대로였어요.',
        solution:
          'early return의 범위를 "스크립트 주입"에만 남기고, 옵저버 등록은 effect가 돌 때마다 항상 실행되도록 분리했습니다.',
        result:
          '테마를 토글하면 giscus 프레임으로 dark_dimmed 가 전달되는 걸 확인했어요. Strict Mode의 두 번 실행이 왜 있는지도 이때 알게 됐습니다.',
      },
      {
        title: '본문 글자 색이 접근성 기준에 못 미쳤다',
        problem:
          'Lighthouse 접근성 점수가 96점이었고, 날짜·태그·설명에 쓰던 흐린 회색이 대비 부족으로 걸렸어요.',
        cause:
          '--ink-muted 를 눈으로만 보고 정했는데, 배경과의 명도 대비가 3.1:1 이었어요. 본문 크기 글자는 WCAG AA 기준으로 4.5:1이 필요합니다.',
        tried:
          '글자 크기를 키워 "큰 글자" 기준(3:1)으로 통과시킬까 했지만, 흐린 보조 정보를 크게 만드는 건 화면 위계를 망가뜨렸어요.',
        solution:
          '색만 조금 진하게 옮겼어요. --ink-muted 를 4.7:1, 강조색을 4.8:1이 되도록 조정했고, 다크 모드 값도 같이 맞췄습니다. 색이 CSS 변수 한 곳에 모여 있어서 세 줄만 고치면 됐어요.',
        result:
          '접근성 96 → 100점. 대비 미달로 잡히던 요소 3종이 0이 됐고, 같은 김에 폰트 @import 를 head의 link + preconnect 로 옮겨 요청 왕복을 하나 줄였습니다.',
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
      '목적지와 일정만 넣으면 AI가 여행 코스를 짜주는 서비스. 팀으로 만들었고 축제 페이지와 리뷰 화면을 맡았어요.',
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
        body: '언제 열리는지가 궁금한 사람과 뭐가 있는지가 궁금한 사람은 보고 싶은 화면이 달랐어요. 같은 데이터를 달력과 목록 두 방식으로 볼 수 있게 만들었습니다.',
      },
      {
        title: '축제 달력·목록 키워드 검색',
        body: '지역 이름으로도, 축제 이름으로도 걸리게 하려다 보니 검색 대상을 어디까지 볼지 정하는 게 실제 일이었어요. 달력과 목록 양쪽에 같은 검색을 붙였습니다.',
      },
      {
        title: '리뷰 화면과 스타일 통일',
        body: '리뷰 목록·상세·작성 버튼 화면을 만들고, 사람마다 다르게 쌓여 있던 스타일을 하나로 맞췄어요.',
      },
    ],
    troubles: [],
    links: [{ label: '저장소', href: 'https://github.com/Tripplai/client' }],
  },
  {
    slug: 'open-way',
    title: 'OPEN WAY',
    period: '2024.11',
    role: '팀장 · 프론트엔드',
    team: '4명',
    summary:
      '2024 경주 지역문제 해결 해커톤 「요즘것들」 출품작. 창업하려는 청년에게 맞는 정책을 추천해주고, 지역의 빈 점포를 공유오피스처럼 빌려 쓰게 하는 서비스예요.',
    stack: ['HTML', 'CSS', 'JavaScript'],
    features: [
      {
        title: 'AI 창업 정책 추천',
        body: '홈 화면에서 AI가 추천한 창업 지원 정책을 바로 보고, 마음에 드는 정책을 누르면 원문으로 이어지게 했어요.',
      },
      {
        title: 'GPS 기반 빈 점포 지도와 예약',
        body: '지도에 지역의 빈 점포를 띄우고, 지역을 검색하면 주변 점포 정보가 나오고 거기서 바로 예약까지 이어지도록 화면을 이었어요.',
      },
      {
        title: '예약이 자동으로 찍히는 달력',
        body: '예약을 마치면 메인 화면 달력에 자동으로 표시되게 했어요. 프레임워크 없이 요일 계산과 화면 전환을 손으로 짜면서, 나중에 쓴 프레임워크가 무엇을 대신 해주고 있었는지 알게 됐습니다. 달력을 직접 그려본 건 이때가 처음이었어요.',
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
