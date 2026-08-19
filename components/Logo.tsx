/**
 * 사이트 로고. 마크 3안을 모두 담아두고 DEFAULT_MARK 한 줄로 바꿔 끼울 수 있어요.
 * - blocks: 2x2 블록 중 마지막 한 칸이 아직 점선 — "아직 짓는 중"
 * - progress: 진행 바가 60%쯤 차 있는 모양
 * - sunset: 지평선 위로 걸린 해 (따뜻한 포인트 컬러)
 */
export type LogoVariant = 'blocks' | 'progress' | 'sunset';

export const DEFAULT_MARK: LogoVariant = 'blocks';

const SUNSET = '#E8863A';

function BlocksMark({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className={className}>
      <rect x="2.5" y="2.5" width="8.5" height="8.5" rx="2" fill="currentColor" />
      <rect x="2.5" y="13" width="8.5" height="8.5" rx="2" fill="currentColor" />
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

function ProgressMark({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className={className}>
      <rect
        x="2"
        y="6.8"
        width="20"
        height="10.4"
        rx="5.2"
        stroke="currentColor"
        strokeWidth="2"
      />
      <rect x="5.2" y="10" width="8.4" height="4" rx="2" fill="currentColor" />
      <circle cx="17.2" cy="12" r="1.5" fill="currentColor" opacity="0.3" />
    </svg>
  );
}

function SunsetMark({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className={className}>
      <path d="M4.6 15.4a7.4 7.4 0 0 1 14.8 0Z" fill={SUNSET} />
      <path
        d="M2.4 15.4h19.2"
        stroke="currentColor"
        strokeWidth="2.1"
        strokeLinecap="round"
      />
      <path
        d="M6.6 19.6h10.8"
        stroke="currentColor"
        strokeWidth="2.1"
        strokeLinecap="round"
        opacity="0.32"
      />
    </svg>
  );
}

const MARKS: Record<LogoVariant, (p: { className?: string }) => JSX.Element> = {
  blocks: BlocksMark,
  progress: ProgressMark,
  sunset: SunsetMark,
};

export function LogoMark({
  variant = DEFAULT_MARK,
  className = 'h-6 w-6',
}: {
  variant?: LogoVariant;
  className?: string;
}) {
  const Mark = MARKS[variant];
  return <Mark className={className} />;
}

export default function Logo({
  variant = DEFAULT_MARK,
  className = '',
}: {
  variant?: LogoVariant;
  className?: string;
}) {
  return (
    <span className={`flex items-center gap-2.5 ${className}`}>
      <LogoMark variant={variant} className="h-6 w-6 shrink-0" />
      <span className="text-xl font-bold tracking-tight">STILL BUILDING</span>
    </span>
  );
}
