import type { Metadata } from 'next';

// robots.txt로도 막아뒀지만, 혹시 주소가 새어나가도 검색에 안 잡히게 한 번 더.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
