import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/Header';

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'STILL BUILDING',
    template: '%s | STILL BUILDING',
  },
  description: '만들며 기록하는 개발과 일상',
  openGraph: {
    title: 'STILL BUILDING',
    description: '만들며 기록하는 개발과 일상',
    siteName: 'STILL BUILDING',
    locale: 'ko_KR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
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
