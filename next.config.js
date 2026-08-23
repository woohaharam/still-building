/** @type {import('next').NextConfig} */

/*
  브라우저에게 "이 사이트는 이렇게만 다뤄달라"고 알려주는 헤더들.
  하나하나가 특정 공격 방식을 막아줘요.
*/
const securityHeaders = [
  // 파일 내용을 보고 타입을 멋대로 추측하지 말 것 (이미지인 척한 스크립트 차단)
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  // 다른 사이트가 우리 페이지를 iframe으로 감싸서 클릭을 가로채지 못하게
  { key: 'X-Frame-Options', value: 'DENY' },
  // 외부로 나갈 때 어느 페이지에서 왔는지는 도메인까지만 알려주기
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // 쓰지도 않는 장치 권한은 아예 막아두기
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), payment=()',
  },
  // 한 번 접속한 뒤로는 항상 https로만
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains',
  },
];

/*
  어디서 온 자원까지 허용할지 정하는 규칙(CSP).

  지금은 Report-Only — 규칙을 어겨도 막지 않고 브라우저 콘솔에만 남겨요.
  giscus와 유튜브가 개발 환경에서 접근이 막혀 있어 실제로 다 확인하지 못했는데,
  잘못 조이면 댓글이나 음악이 조용히 안 뜹니다. 실제 사이트에서 콘솔에
  경고가 안 뜨는 걸 확인한 뒤에 Report-Only를 떼고 진짜로 막으면 돼요.
*/
const csp = [
  "default-src 'self'",
  // Next.js가 페이지를 띄울 때 인라인 스크립트를 쓰기 때문에 unsafe-inline이 필요해요.
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://giscus.app https://www.youtube.com",
  "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net",
  "font-src 'self' data: https://cdn.jsdelivr.net",
  "img-src 'self' data: blob: https://*.supabase.co https://avatars.githubusercontent.com",
  "connect-src 'self' https://*.supabase.co https://giscus.app",
  'frame-src https://giscus.app https://www.youtube-nocookie.com https://www.youtube.com',
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join('; ');

const nextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          ...securityHeaders,
          { key: 'Content-Security-Policy-Report-Only', value: csp },
        ],
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
  },
};

module.exports = nextConfig;
