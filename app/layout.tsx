import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/Header';
import MusicPlayer from '@/components/MusicPlayer';
import JsonLd from '@/components/JsonLd';
import { seoulDateKey } from '@/lib/calendar';
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

/**
 * 5분마다 다시 그린다.
 *
 * 헤더의 복무 상태(components/ServiceBadge.tsx)가 지금 날짜와 시각을 본다.
 * 이게 없으면 고정 페이지들은 빌드할 때 HTML 이 굳어서, 전역한 뒤에도 다음
 * 배포 전까지 '복무 중'이 남는다.
 *
 * 처음에는 한 시간이었다. 전역 여부는 하루에 한 번 바뀌니 그걸로 넉넉했는데,
 * 외출 복귀가 20:30 이라 상태가 분 단위로도 바뀌게 되면서 한 시간은 너무
 * 굵어졌다. 자기 값이 있는 페이지(revalidate = 0)는 그쪽이 이겨서 늘 정확하다.
 */
export const revalidate = 300;

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
        {/*
          키보드로 들어오면 헤더 링크 아홉 개를 지나야 본문에 닿는다. 페이지를
          옮길 때마다 아홉 번이다. 이 링크는 평소에 숨어 있다가 첫 Tab 에서만
          나타나서, 한 번 눌러 본문으로 건너뛰게 한다 (WCAG 2.4.1).

          sr-only 로 숨긴다. display:none 으로 숨기면 초점이 가지 않아서 Tab
          으로 꺼낼 수가 없다 — 숨기되 읽히기는 해야 한다.
        */}
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:border focus:border-line focus:bg-paper focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-ink"
        >
          본문으로 건너뛰기
        </a>
        <Header />
        {/*
          tabIndex={-1} 이 있어야 건너뛴 뒤 초점이 여기 앉는다. main 은 원래
          초점을 받지 않아서, 없으면 주소만 바뀌고 다음 Tab 이 다시 헤더로
          돌아간다. -1 이라 Tab 순서에는 끼지 않는다.
        */}
        <main id="main" tabIndex={-1} className="min-h-[60vh] py-12">
          {children}
        </main>
        <footer className="no-print mt-20 border-t border-line">
          {/*
            좁은 화면에서는 링크가 한 줄에 다 안 들어간다. 줄바꿈을 막아두면
            글자가 세로로 눌려서 '이 력 서'처럼 쌓인다. 넘치면 접히게 둔다.
          */}
          <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-x-6 gap-y-3 px-6 py-8 text-xs text-ink-muted">
            <span>
              &copy; {seoulDateKey().slice(0, 4)} {siteName}
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
