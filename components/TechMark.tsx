import type { CSSProperties } from 'react';
import { Tech } from '@/lib/tech';

/**
 * 기술 로고 하나.
 *
 * 색은 인라인 변수로 넘기고 밝고 어두운 테마는 CSS 가 고른다 (globals.css 의
 * .tech-mark). 로고마다 색이 달라서 클래스로는 못 묶고, 인라인 style 하나로는
 * 테마를 못 가른다.
 *
 * 무채색 로고(Vercel · Next.js)는 변수를 비워둔다. 그러면 .tech-mark 의
 * 기본값인 currentColor 가 남아서 글자색을 그대로 따라간다.
 *
 * aria-hidden 인 이유는 옆에 이름이 글자로 같이 있어서다. 로고에 또 이름을
 * 달면 화면 낭독기가 같은 말을 두 번 읽는다.
 */
export default function TechMark({ tech }: { tech: Tech }) {
  if (!tech.icon) {
    return (
      <span
        className="flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border border-current text-[9px] font-bold leading-none"
        aria-hidden
      >
        {tech.letter}
      </span>
    );
  }

  const tone = {
    '--tech-light': tech.icon.light,
    '--tech-dark': tech.icon.dark,
  } as CSSProperties;

  return (
    <svg
      viewBox="0 0 24 24"
      className="tech-mark h-4 w-4 shrink-0"
      style={tech.icon.light ? tone : undefined}
      fill="currentColor"
      aria-hidden
    >
      <path d={tech.icon.path} />
    </svg>
  );
}
