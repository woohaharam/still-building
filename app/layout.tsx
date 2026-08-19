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
    <html lang="ko" suppressHydrationWarning>
      <head>
        {/*
          화면이 한 번 하얗게 번쩍였다가 어두워지는 걸 막으려고,
          리액트가 붙기 전에 테마를 먼저 정해둬요.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try {
  var saved = localStorage.getItem('theme');
  var dark = saved ? saved === 'dark'
    : window.matchMedia('(prefers-color-scheme: dark)').matches;
  if (dark) document.documentElement.classList.add('dark');
} catch (e) {}`,
          }}
        />
      </head>
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
