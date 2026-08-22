import type { Metadata } from 'next';
import {
  siteAuthor,
  siteAuthorAlias,
  siteEmail,
  siteGithub,
  siteUrl,
} from '@/lib/site';

export const metadata: Metadata = {
  title: '소개',
  description: `${siteAuthor}가 만든 것들과, 이 블로그를 쓰는 이유.`,
  alternates: { canonical: `${siteUrl}/about` },
};

export default function AboutPage() {
  return (
    <div className="flex flex-col gap-16">
      <section>
        <h1 className="mb-4 text-2xl font-bold">소개</h1>
        <p className="leading-relaxed text-ink-soft">
          {siteAuthor} ({siteAuthorAlias})입니다. 필요한 걸 직접 만들고, 만들면서
          배운 것과 그 사이의 생각을 여기에 남기고 있어요.
        </p>
      </section>

      <section>
        <h2 className="mb-6 text-lg font-semibold">만든 것들</h2>
        <div className="flex flex-col gap-8">
          <ProjectCard
            title="STILL BUILDING"
            description="지금 보고 계신 블로그. 글쓰기와 일정을 한 곳에서 관리하려고 직접 만들었어요. 달력, 검색, 다크 모드, 링크 미리보기 카드까지 붙어 있고, 글은 관리자 페이지에서 마크다운으로 씁니다."
            stack="Next.js 14 · TypeScript · Tailwind · Supabase · Vercel"
            link={siteGithub + '/still-building'}
          />
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold">연락</h2>
        <ul className="flex flex-col gap-2 text-sm text-ink-soft">
          <li>
            <a
              href={`mailto:${siteEmail}`}
              className="underline underline-offset-4 transition-colors hover:text-ink"
            >
              {siteEmail}
            </a>
          </li>
          <li>
            <a
              href={siteGithub}
              target="_blank"
              rel="noreferrer"
              className="underline underline-offset-4 transition-colors hover:text-ink"
            >
              github.com/woohaharam
            </a>
          </li>
        </ul>
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
      target="_blank"
      rel="noreferrer"
      className="block rounded-lg border border-line p-6 transition-colors hover:border-ink-muted"
    >
      <h3 className="font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-ink-soft">{description}</p>
      <p className="mt-3 text-xs text-ink-muted">{stack}</p>
    </a>
  );
}
