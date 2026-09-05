import Link from 'next/link';
import DaysCounter from './DaysCounter';
import Logo from './Logo';
import ThemeToggle from './ThemeToggle';
import { siteDescription, siteName, siteTitle } from '@/lib/site';

const NAV = [
  { href: '/about', label: '소개' },
  { href: '/projects', label: '프로젝트' },
  { href: '/blog', label: '블로그' },
  { href: '/books', label: '독후감' },
  { href: '/travel', label: '여행' },
  { href: '/calendar', label: '캘린더' },
];

export default function Header() {
  return (
    <header className="no-print border-b border-line">
      <div className="mx-auto flex max-w-4xl flex-col gap-4 px-6 py-8 sm:gap-3 sm:py-10">
        {/*
          좁은 화면에서는 로고와 메뉴가 한 줄에 다 안 들어간다.
          억지로 줄이는 대신 두 줄로 나눈다.
        */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center justify-between gap-4">
            <Link href="/" aria-label={`${siteTitle} 홈`}>
              <Logo />
            </Link>

            {/*
              메뉴가 여섯 개라 좁은 화면에서는 토글이 줄 끝에 못 붙고 혼자
              다음 줄로 떨어진다. 그래서 좁을 때는 로고 옆에 둔다.
              display:none 으로 감춘 쪽은 접근성 트리에서도 빠지므로
              버튼이 둘로 읽히지 않는다.
            */}
            <span className="sm:hidden">
              <ThemeToggle />
            </span>
          </div>

          <nav className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-ink-soft sm:gap-x-5">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="whitespace-nowrap transition-colors hover:text-ink"
              >
                {item.label}
              </Link>
            ))}
            <span className="hidden sm:inline-flex">
              <ThemeToggle />
            </span>
          </nav>
        </div>

        {/* 태그라인은 좁은 화면에서 헤더가 너무 길어지지 않게 감춘다. */}
        <div className="hidden items-center justify-between text-sm text-ink-muted sm:flex">
          <p>
            {siteName} · {siteDescription}
          </p>
          <DaysCounter />
        </div>
      </div>
    </header>
  );
}
