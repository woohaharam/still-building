import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/Header';
import MusicPlayer from '@/components/MusicPlayer';
import JsonLd from '@/components/JsonLd';
import {
  googleSiteVerification,
  naverSiteVerification,
  siteAuthor,
  siteDescription,
  siteName,
  siteUrl,
} from '@/lib/site';

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
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      // 검색 결과에 큰 썸네일과 긴 설명이 나오도록 허용해요.
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    ...(googleSiteVerification ? { google: googleSiteVerification } : {}),
    ...(naverSiteVerification
      ? { other: { 'naver-site-verification': naverSiteVerification } }
      : {}),
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
        <JsonLd
          data={{
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: siteName,
            description: siteDescription,
            url: siteUrl,
            inLanguage: 'ko-KR',
            author: { '@type': 'Person', name: siteAuthor },
          }}
        />
        <Header />
        <main className="min-h-[60vh] py-12">{children}</main>
        <footer className="mt-20 border-t border-line">
          <div className="mx-auto flex max-w-4xl justify-between px-6 py-8 text-xs text-ink-muted">
            <span>
              &copy; {new Date().getFullYear()} {siteName}
            </span>
            <span className="flex items-center gap-4">
              <a href="/feed.xml" className="hover:text-ink-soft">
                RSS
              </a>
              <a
                href="https://github.com/woohaharam"
                target="_blank"
                rel="noreferrer"
                className="hover:text-ink-soft"
              >
                GitHub
              </a>
            </span>
          </div>
        </footer>
        <MusicPlayer />
      </body>
    </html>
  );
}
