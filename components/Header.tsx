import Link from 'next/link';
import DaysCounter from './DaysCounter';
import Logo from './Logo';
import ThemeToggle from './ThemeToggle';

export default function Header() {
  return (
    <header className="border-b border-line">
      <div className="max-w-content mx-auto px-6 py-10 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <Link href="/" aria-label="STILL BUILDING 홈">
            <Logo />
          </Link>
          <nav className="flex items-center gap-5 text-sm text-ink-soft">
            <Link href="/calendar" className="hover:text-ink transition-colors">
              달력
            </Link>
            <Link href="/about" className="hover:text-ink transition-colors">
              소개
            </Link>
            <a
              href="https://github.com/woohaharam"
              target="_blank"
              rel="noreferrer"
              className="hover:text-ink transition-colors"
            >
              GitHub
            </a>
            <ThemeToggle />
          </nav>
        </div>
        <div className="flex items-center justify-between text-sm text-ink-muted">
          <p>만들며 기록하는 개발과 일상</p>
          <DaysCounter />
        </div>
      </div>
    </header>
  );
}
