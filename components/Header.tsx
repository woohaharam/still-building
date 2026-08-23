import Link from 'next/link';
import DaysCounter from './DaysCounter';
import Logo from './Logo';
import ThemeToggle from './ThemeToggle';
import { siteDescription, siteName, siteTitle } from '@/lib/site';

const NAV = [
  { href: '/about', label: '소개' },
  { href: '/projects', label: '프로젝트' },
  { href: '/blog', label: '블로그' },
  { href: '/calendar', label: '달력' },
];

export default function Header() {
  return (
    <header className="border-b border-line">
      <div className="mx-auto flex max-w-4xl flex-col gap-4 px-6 py-8 sm:gap-3 sm:py-10">
        {/*
          좁은 화면에서는 로고와 메뉴가 한 줄에 다 안 들어가요.
          억지로 줄이는 대신 두 줄로 나눕니다.
        */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Link href="/" aria-label={`${siteTitle} 홈`} className="self-start">
            <Logo />
          </Link>

          <nav className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-ink-soft">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="whitespace-nowrap transition-colors hover:text-ink"
              >
                {item.label}
              </Link>
            ))}
            <a
              href="https://github.com/woohaharam"
              target="_blank"
              rel="noreferrer"
              className="whitespace-nowrap transition-colors hover:text-ink"
            >
              GitHub
            </a>
            <ThemeToggle />
          </nav>
        </div>

        {/* 태그라인은 좁은 화면에서 헤더가 너무 길어지지 않게 감춰요. */}
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
