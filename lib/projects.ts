export interface Project {
  slug: string;
  title: string;
  period: string;
  summary: string;
  /** 자세히 — 무엇을 왜 만들었고 뭘 배웠는지 */
  details: string[];
  stack: string[];
  links: { label: string; href: string }[];
}

/**
 * 프로젝트를 추가하려면 여기에 항목을 하나 더 넣으면 돼요.
 * 목록(/projects)과 메인의 개수 표시가 모두 이 배열을 따라갑니다.
 */
export const PROJECTS: Project[] = [
  {
    slug: 'still-building',
    title: 'STILL BUILDING',
    period: '2026.08 —',
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
];
