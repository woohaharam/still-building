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
  siteInstagram,
  siteName,
  siteTitle,
  siteUrl,
} from '@/lib/site';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteTitle,
    template: `%s | ${siteTitle}`,
  },
  description: siteDescription,
  openGraph: {
    title: siteTitle,
    description: siteDescription,
    siteName: siteTitle,
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
      // 검색 결과에 큰 썸네일과 긴 설명이 나오도록 허용한다.
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
          폰트는 globals.css 의 @import 가 아니라 여기서 불러온다.
          @import는 CSS를 받아 파싱한 뒤에야 폰트 요청이 시작돼서
          왕복이 한 번 더 늘어난다.
        */}
        <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.css"
        />

        {/*
          화면이 한 번 하얗게 번쩍였다가 어두워지는 걸 막으려고,
          리액트가 붙기 전에 테마를 먼저 정해둔다.
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
            name: siteTitle,
            alternateName: siteName,
            description: siteDescription,
            url: siteUrl,
            inLanguage: 'ko-KR',
            author: { '@type': 'Person', name: siteAuthor },
          }}
        />
        <Header />
        <main className="min-h-[60vh] py-12">{children}</main>
        <footer className="no-print mt-20 border-t border-line">
          {/*
            좁은 화면에서는 링크가 한 줄에 다 안 들어간다. 줄바꿈을 막아두면
            글자가 세로로 눌려서 '이 력 서'처럼 쌓인다. 넘치면 접히게 둔다.
          */}
          <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-x-6 gap-y-3 px-6 py-8 text-xs text-ink-muted">
            <span>
              &copy; {new Date().getFullYear()} {siteName}
            </span>
            <span className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <a href="/resume" className="hover:text-ink-soft">
                이력서
              </a>
              <a href="/service" className="hover:text-ink-soft">
                복무
              </a>
              <a href="/privacy" className="hover:text-ink-soft">
                개인정보
              </a>
              <a href="/feed.xml" className="hover:text-ink-soft">
                RSS
              </a>
              <a
                href={siteInstagram}
                target="_blank"
                rel="noreferrer"
                className="hover:text-ink-soft"
              >
                Instagram
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
