import type { Metadata } from 'next';
import { siteAuthor, siteUrl } from '@/lib/site';

export const metadata: Metadata = {
  title: '소개',
  description: `${siteAuthor}가 만든 것들과, 이 블로그를 쓰는 이유.`,
  alternates: { canonical: `${siteUrl}/about` },
};

export default function AboutPage() {
  return (
    <div className="flex flex-col gap-16">
      <section>
        <h1 className="text-2xl font-bold mb-4">소개</h1>
        <p className="text-ink-soft leading-relaxed">
          혼자 만들고 기록하는 개발자입니다. 필요한 걸 직접 만들고,
          만들면서 배운 것과 그 사이의 생각을 여기에 남기고 있어요.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-6">만든 것들</h2>
        <div className="flex flex-col gap-8">
          <ProjectCard
            title="다시, 하루"
            description="감정 회복과 하루의 기분을 기록하는 웹앱. 매일의 체크인, 기분 그래프, D+day 카운터를 통해 스스로를 돌아볼 수 있게 만들었어요."
            stack="Next.js 14 · TypeScript · Tailwind · Supabase · Recharts"
            link="#"
          />
          <ProjectCard
            title="가족 기록 블로그"
            description="가족만 볼 수 있는 비공개 추억 기록 공간. 비밀번호 인증, 사진 업로드, 음악 재생 기능을 붙였어요."
            stack="Supabase · Netlify"
            link="#"
          />
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-4">연락</h2>
        <p className="text-ink-soft text-sm">
          이메일이나 GitHub 링크를 여기에 남겨두세요.
        </p>
      </section>
    </div>
  );
}

function ProjectCard({
  title,
  description,
  stack,
  link,
}: {
  title: string;
  description: string;
  stack: string;
  link: string;
}) {
  return (
    <a
      href={link}
      className="block border border-line rounded-lg p-6 hover:border-ink-muted transition-colors"
    >
      <h3 className="font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-ink-soft leading-relaxed">{description}</p>
      <p className="mt-3 text-xs text-ink-muted">{stack}</p>
    </a>
  );
}
