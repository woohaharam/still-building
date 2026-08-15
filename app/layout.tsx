import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/Header';

export const metadata: Metadata = {
  title: 'STILL BUILDING',
  description: '만들며 기록하는 개발과 일상',
  openGraph: {
    title: 'STILL BUILDING',
    description: '만들며 기록하는 개발과 일상',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>
        <Header />
        <main className="max-w-content mx-auto px-6 py-12 min-h-[60vh]">
          {children}
        </main>
        <footer className="border-t border-line mt-20">
          <div className="max-w-content mx-auto px-6 py-8 text-xs text-ink-muted flex justify-between">
            <span>&copy; {new Date().getFullYear()} STILL BUILDING</span>
            <a href="/about" className="hover:text-ink-soft">소개</a>
          </div>
        </footer>
      </body>
    </html>
  );
}
