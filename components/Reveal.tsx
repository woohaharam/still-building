/**
 * 페이지가 뜰 때 한 번 떠오르듯 나타난다.
 *
 * 예전에는 IntersectionObserver 로 화면에 들어올 때 띄웠다. 스크롤에 맞춰
 * 나타나서 보기에는 좋았는데, 자바스크립트가 돌기 전에는 opacity 가 0 이라
 * 스크립트가 막히거나 실패하면 내용이 영원히 안 보였다. 실제로 프로젝트
 * 상세에서 트러블슈팅 전체가 빈 화면으로 남았다. 포트폴리오에서 내용이
 * 안 보이는 건 효과로 메울 수 있는 손해가 아니다.
 *
 * 그래서 CSS 애니메이션으로 바꿨다. 스크롤 위치를 못 따라가는 대신, 스크립트
 * 없이도 끝나면 반드시 보인다. 움직임을 줄여달라고 설정한 브라우저에서는
 * globals.css 가 애니메이션 자체를 끄고, 그러면 처음부터 보인다.
 */
export default function Reveal({
  children,
  delay = 0,
  className = '',
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <div
      className={`rise ${className}`}
      style={delay ? { animationDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}
