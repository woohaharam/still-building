/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      // 소개 내용이 메인으로 합쳐졌어요. 예전 주소로 들어와도 안 끊기게.
      { source: '/about', destination: '/', permanent: true },
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
