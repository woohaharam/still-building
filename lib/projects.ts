export interface Project {
  slug: string;
  title: string;
  period: string;
  /** 혼자 만든 건지, 팀에서 어느 부분을 맡았는지 */
  role: string;
  summary: string;
  /** 자세히 — 무엇을 왜 만들었고 뭘 배웠는지 */
  details: string[];
  stack: string[];
  links: { label: string; href: string }[];
}

/**
 * 프로젝트를 추가하려면 여기에 항목을 하나 더 넣으면 돼요.
 * 목록(/projects)과 메인의 개수 표시가 모두 이 배열을 따라갑니다.
 * 최근에 한 것부터 위로.
 */
export const PROJECTS: Project[] = [
  {
    slug: 'still-building',
    title: 'STILL BUILDING',
    period: '2026.08 —',
    role: '개인 프로젝트 · 전부',
    summary:
      '글쓰기와 일정을 한 곳에서 관리하려고 직접 만든 개인 블로그. 지금 보고 계신 사이트예요.',
    details: [
      '마크다운으로 글을 쓰고 바로 발행할 수 있는 관리자 페이지를 만들었어요. 임시저장한 글은 실제 화면 그대로 미리 볼 수 있어요.',
      '일정과 글 쓴 날을 한 화면에 겹쳐 보는 달력을 붙였어요. 날짜 계산에서 시간대 문제를 만나 직접 처리했어요.',
      '처음엔 관리자 비밀번호를 브라우저에서 검사했는데, 그건 화면만 가리는 수준이라 데이터베이스 권한으로 옮겼어요.',
      '검색 노출을 위해 사이트맵·RSS·구조화 데이터를 붙이고 네이버 서치어드바이저에 등록했어요.',
      '핵심 함수에는 테스트를 붙이고, PR마다 린트·타입·테스트·빌드가 자동으로 도는 CI를 걸어뒀어요.',
    ],
    stack: ['Next.js 14', 'TypeScript', 'Tailwind', 'Supabase', 'Vercel'],
    links: [
      { label: '저장소', href: 'https://github.com/woohaharam/still-building' },
      { label: '블로그 글', href: '/blog' },
    ],
  },
  {
    slug: 'tripplai',
    title: 'Tripplai',
    period: '2025.03 — 2025.05',
    role: '팀 프로젝트 · 프론트엔드(축제·리뷰)',
    summary:
      '목적지와 일정만 넣으면 AI가 여행 코스를 짜주는 서비스. 여러 명이 함께 만든 팀 프로젝트에서 축제 페이지와 리뷰 화면을 맡았어요.',
    details: [
      '축제 정보를 달력과 목록, 두 가지 방식으로 볼 수 있게 만들었어요. 언제 열리는지가 궁금한 사람과 뭐가 있는지가 궁금한 사람은 보고 싶은 화면이 달랐어요.',
      '달력과 목록 양쪽에 키워드 검색을 붙였어요. 지역 이름으로도, 축제 이름으로도 걸리게 하려다 보니 검색 대상을 어디까지 볼지 정하는 게 실제 일이었어요.',
      '리뷰 목록·상세·작성 버튼 화면을 만들고, 사람마다 다르게 쌓여 있던 스타일을 하나로 맞췄어요.',
      '여러 명이 같은 코드를 동시에 고치는 상황을 여기서 처음 겪었어요. 브랜치를 나눠 작업하고 PR로 합치는 흐름이 왜 필요한지 그때 알았어요.',
    ],
    stack: [
      'Next.js 15',
      'TypeScript',
      'Tailwind CSS',
      'React Query',
      'NextAuth.js',
    ],
    links: [{ label: '저장소', href: 'https://github.com/Tripplai/client' }],
  },
  {
    slug: 'open-way',
    title: 'OPEN WAY',
    period: '2024.11',
    role: '팀장 · 프론트엔드',
    summary:
      '2024 경주 지역문제 해결 해커톤 「요즘것들」 출품작. 창업하려는 청년에게 맞는 정책을 추천해주고, 지역의 빈 점포를 공유오피스처럼 빌려 쓰게 하는 서비스예요.',
    details: [
      '홈 화면에서 AI가 추천한 창업 지원 정책을 바로 보고, 마음에 드는 정책을 누르면 원문으로 이어지게 했어요.',
      'GPS 기반 지도에 지역의 빈 점포를 띄우고, 지역을 검색하면 주변 점포 정보가 나오고 거기서 바로 예약까지 이어지도록 화면을 이었어요.',
      '예약을 마치면 메인 화면 달력에 자동으로 표시되게 했어요. 달력을 직접 그려본 건 이때가 처음이었어요.',
      '프레임워크 없이 HTML·CSS·JavaScript만으로 만들었어요. 요일 계산과 화면 전환을 전부 손으로 짜면서, 나중에 쓴 프레임워크가 무엇을 대신 해주고 있었는지 알게 됐어요.',
      '팀장으로서 정해진 기간 안에 네 명이 끝낼 수 있는 크기로 기능을 잘라내는 일을 했어요. 넣고 싶었던 걸 빼는 판단이 제일 어려웠어요.',
    ],
    stack: ['HTML', 'CSS', 'JavaScript'],
    links: [
      {
        label: '저장소',
        href: 'https://github.com/woohaharam/2024hackathon_yojeumgeosdeul',
      },
    ],
  },
];
