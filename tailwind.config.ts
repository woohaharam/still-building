import type { Config } from 'tailwindcss';

/** 실제 색깔 값은 globals.css의 CSS 변수에 있다. 다크 모드는 거기서 한 번에 갈아끼운다. */
const config: Config = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    // lib에서도 클래스 이름을 쓰는 곳이 있다(본문 이미지 크기).
    // 여기 빠져 있으면 그 클래스만 조용히 생성되지 않는다.
    './lib/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        paper: 'rgb(var(--paper) / <alpha-value>)',
        surface: 'rgb(var(--surface) / <alpha-value>)',
        ink: {
          DEFAULT: 'rgb(var(--ink) / <alpha-value>)',
          soft: 'rgb(var(--ink-soft) / <alpha-value>)',
          muted: 'rgb(var(--ink-muted) / <alpha-value>)',
        },
        line: 'rgb(var(--line) / <alpha-value>)',
        accent: 'rgb(var(--accent) / <alpha-value>)',
        danger: 'rgb(var(--danger) / <alpha-value>)',
        leave: {
          outing: 'rgb(var(--leave-outing) / <alpha-value>)',
          overnight: 'rgb(var(--leave-overnight) / <alpha-value>)',
          leave: 'rgb(var(--leave-leave) / <alpha-value>)',
          final: 'rgb(var(--leave-final) / <alpha-value>)',
        },
      },
      fontFamily: {
        sans: [
          'Pretendard',
          '-apple-system',
          'BlinkMacSystemFont',
          'sans-serif',
        ],
      },
      maxWidth: {
        content: '680px',
      },
    },
  },
  plugins: [],
};

export default config;
