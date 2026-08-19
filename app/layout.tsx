import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/Header';
import { siteDescription, siteName, siteUrl } from '@/lib/site';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteName,
    template: `%s | ${siteName}`,
  },
  description: siteDescription,
  openGraph: {
    title: siteName,
    description: siteDescription,
    siteName,
    locale: 'ko_KR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
  },
  alternates: {
    types: {
      'application/rss+xml': `${siteUrl}/feed.xml`,
    },
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
            <span>&copy; {new Date().getFullYear()} {siteName}</span>
            <span className="flex items-center gap-4">
              <a href="/feed.xml" className="hover:text-ink-soft">RSS</a>
              <a href="/about" className="hover:text-ink-soft">소개</a>
            </span>
          </div>
        </footer>
      </body>
    </html>
  );
}
