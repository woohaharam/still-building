import { siteTitle } from '@/lib/site';

/**
 * 사이트 로고.
 *
 * 2x2 블록 중 마지막 한 칸만 점선이다. 사이트 이름(STILL BUILDING)과 같은 말,
 * 아직 짓는 중이라는 뜻이다.
 *
 * 한동안 마크 세 벌(블록 · 진행 바 · 지평선의 해)을 같이 두고 한 줄로 바꿔
 * 끼울 수 있게 해뒀다. 고른 뒤로 한 번도 바꾸지 않았고 앞으로도 그럴 것이다 —
 * 로고는 고르고 나면 정해지는 것이라, 갈아끼울 자리를 남겨둘 이유가 없었다.
 * 안 고른 두 벌과 그걸 고르는 장치를 걷어냈다.
 *
 * 같은 모양이 app/icon.svg 에도 있다. 그쪽은 브라우저 탭에 뜨는 파일이라
 * 빌드를 거치지 않는 정적 SVG 여야 해서, 여기서 끌어다 쓸 수가 없다. 마크를
 * 바꾸면 두 파일을 같이 고쳐야 한다.
 */
function Mark({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className={className}>
      <rect
        x="2.5"
        y="2.5"
        width="8.5"
        height="8.5"
        rx="2"
        fill="currentColor"
      />
      <rect
        x="2.5"
        y="13"
        width="8.5"
        height="8.5"
        rx="2"
        fill="currentColor"
      />
      <rect x="13" y="13" width="8.5" height="8.5" rx="2" fill="currentColor" />
      <rect
        x="13.9"
        y="3.4"
        width="6.7"
        height="6.7"
        rx="1.6"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeDasharray="2.6 2.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function Logo({ className = '' }: { className?: string }) {
  return (
    <span className={`flex items-center gap-2 sm:gap-2.5 ${className}`}>
      <Mark className="h-6 w-6 shrink-0" />
      <span className="whitespace-nowrap text-lg font-bold tracking-tight sm:text-xl">
        {siteTitle}
      </span>
    </span>
  );
}
