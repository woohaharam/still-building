import { ImageResponse } from 'next/og';
import { loadKoreanFont } from '@/lib/og-font';
import { siteDescription, siteName, siteTitle } from '@/lib/site';

export const alt = siteTitle;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

// 로고 마크를 data URI SVG로 넣는다 (satori에서 가장 안전하게 렌더된다).
const MARK = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="120" height="120">
  <rect x="2.5" y="2.5" width="8.5" height="8.5" rx="2" fill="#211E1B"/>
  <rect x="2.5" y="13" width="8.5" height="8.5" rx="2" fill="#211E1B"/>
  <rect x="13" y="13" width="8.5" height="8.5" rx="2" fill="#211E1B"/>
  <rect x="13.9" y="3.4" width="6.7" height="6.7" rx="1.6" fill="none"
    stroke="#211E1B" stroke-width="1.9" stroke-dasharray="2.6 2.4" stroke-linecap="round"/>
</svg>`;

const SUBTITLE = `${siteName} — ${siteDescription}`;

export default async function OpengraphImage() {
  // 한글이 들어가면 폰트를 같이 넘겨야 한다. 안 그러면 네모로 나온다.
  const font = await loadKoreanFont(`${siteTitle}${SUBTITLE}`);

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        background: '#FBF9F5',
        padding: '80px',
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        width="120"
        height="120"
        alt=""
        src={`data:image/svg+xml;utf8,${encodeURIComponent(MARK)}`}
      />

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div
          style={{
            fontSize: 92,
            fontWeight: 700,
            letterSpacing: '-0.02em',
            color: '#211E1B',
          }}
        >
          {siteTitle}
        </div>
        <div style={{ fontSize: 34, color: '#6B6B65', marginTop: 18 }}>
          {SUBTITLE}
        </div>
      </div>
    </div>,
    {
      ...size,
      fonts: font
        ? [{ name: 'Noto Sans KR', data: font, weight: 700 as const }]
        : undefined,
    }
  );
}
