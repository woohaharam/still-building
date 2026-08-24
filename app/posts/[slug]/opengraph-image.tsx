import { ImageResponse } from 'next/og';
import { getPostBySlug } from '@/lib/posts';
import { loadKoreanFont } from '@/lib/og-font';
import { siteName } from '@/lib/site';

export const alt = siteName;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const MARK = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="72" height="72">
  <rect x="2.5" y="2.5" width="8.5" height="8.5" rx="2" fill="#211E1B"/>
  <rect x="2.5" y="13" width="8.5" height="8.5" rx="2" fill="#211E1B"/>
  <rect x="13" y="13" width="8.5" height="8.5" rx="2" fill="#211E1B"/>
  <rect x="13.9" y="3.4" width="6.7" height="6.7" rx="1.6" fill="none"
    stroke="#211E1B" stroke-width="1.9" stroke-dasharray="2.6 2.4" stroke-linecap="round"/>
</svg>`;

function formatDate(value: string | null) {
  if (!value) return '';
  const d = new Date(value);
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
}

export default async function PostOgImage({
  params,
}: {
  params: { slug: string };
}) {
  const post = await getPostBySlug(decodeURIComponent(params.slug));

  const title = post?.title || siteName;
  const date = formatDate(post?.published_at ?? null);
  // 제목이 길면 글자를 줄여서 로고와 부딪히지 않게 한다.
  const titleSize = title.length > 70 ? 46 : title.length > 40 ? 56 : 68;
  // 카드에 실제로 그릴 글자만 모아서 폰트를 요청한다.
  const font = await loadKoreanFont(`${title}${date}${siteName}…`);

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
        fontFamily: font ? 'Noto Sans KR' : undefined,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          width="72"
          height="72"
          alt=""
          src={`data:image/svg+xml;utf8,${encodeURIComponent(MARK)}`}
        />
        <div
          style={{ fontSize: 30, color: '#6B6B65', letterSpacing: '0.02em' }}
        >
          {siteName}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div
          style={{
            fontSize: titleSize,
            fontWeight: 700,
            lineHeight: 1.28,
            letterSpacing: '-0.02em',
            color: '#211E1B',
            // 제목이 길면 잘라내서 카드 밖으로 넘치지 않게
            display: 'block',
            lineClamp: 3,
          }}
        >
          {title}
        </div>
        {date && (
          <div style={{ fontSize: 30, color: '#8A8A85', marginTop: 28 }}>
            {date}
          </div>
        )}
      </div>
    </div>,
    {
      ...size,
      fonts: font
        ? [{ name: 'Noto Sans KR', data: font, weight: 700, style: 'normal' }]
        : [],
    }
  );
}
