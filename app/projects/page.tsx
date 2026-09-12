import type { Metadata } from 'next';
import Link from 'next/link';
import Container from '@/components/Container';
import WorkNav from '@/components/WorkNav';
import Reveal from '@/components/Reveal';
import Bullets from '@/components/project/Bullets';
import Pills from '@/components/project/Pills';
import ProjectLinks from '@/components/project/ProjectLinks';
import { KEEPSAKES, PROJECTS } from '@/lib/projects';
import { siteUrl } from '@/lib/site';

export const metadata: Metadata = {
  title: '프로젝트',
  description: '직접 만든 것들과, 만들면서 부딪힌 것들.',
  alternates: { canonical: `${siteUrl}/projects` },
};

/** 인원 · 기여도 · 기간처럼 짧은 사실들을 한 줄로. */
function Facts({ items }: { items: (string | undefined)[] }) {
  const shown = items.filter(Boolean) as string[];
  if (shown.length === 0) return null;

  return (
    <p className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-ink-muted">
      {shown.map((item, i) => (
        <span key={item}>
          {i > 0 && <span className="mr-3 opacity-50">·</span>}
          {item}
        </span>
      ))}
    </p>
  );
}

export default function ProjectsPage() {
  return (
    <Container wide>
      <div className="flex flex-col gap-16 pb-6">
        <section className="flex flex-col gap-6">
          <div>
            <h1 className="mt-4 text-3xl font-bold tracking-tight">
              만든 것들
            </h1>
            <p className="mt-5 leading-relaxed text-ink-soft">
              필요해서 만들었고, 만들다 막힌 것들을 적어뒀습니다. 제목을 누르면
              구조도와 트러블슈팅까지 볼 수 있어요.
            </p>
          </div>

          <WorkNav active="projects" counts={{ projects: PROJECTS.length }} />
        </section>

        <div className="flex flex-col gap-12">
          {PROJECTS.map((project) => (
            <Reveal key={project.slug}>
              <article className="border-t border-line pt-10">
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <h2 className="text-2xl font-bold tracking-tight">
                    <Link
                      href={`/projects/${project.slug}`}
                      className="transition-colors hover:text-accent"
                    >
                      {project.title}
                    </Link>
                  </h2>
                  <span className="text-xs tabular-nums text-ink-muted">
                    {project.period}
                  </span>
                </div>

                <Facts
                  items={[
                    project.role,
                    project.team && `개발 인원 ${project.team}`,
                    project.contribution && `기여도 ${project.contribution}`,
                  ]}
                />

                <p className="mt-4 leading-relaxed text-ink-soft">
                  {project.summary}
                </p>

                {project.impact && <Bullets items={project.impact} />}

                <Pills items={project.stack} />

                <ProjectLinks
                  links={[
                    { label: '자세히 보기', href: `/projects/${project.slug}` },
                    ...project.links,
                  ]}
                />
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal>
          {/*
            프로젝트 배열과 섞지 않는다. 기간·기여도·트러블슈팅을 적을 성격이
            아니고, 이력서에도 딸려가면 안 된다. 이름과 주소만 둔다.
          */}
          <section className="border-t border-line pt-10">
            <h2 className="section-label mb-4">그 밖에</h2>
            <p className="mb-6 text-sm leading-relaxed text-ink-soft">
              입대하기 전에 만든 페이지 두 개입니다. 프로젝트라고 할 만한 규모는
              아니지만, 남 보라고 만든 첫 결과물이라 남겨둡니다.
            </p>

            <ul className="flex flex-col">
              {KEEPSAKES.map((keepsake) => (
                <li key={keepsake.href}>
                  <a
                    href={keepsake.href}
                    target="_blank"
                    rel="noreferrer"
                    className="group flex items-baseline justify-between gap-4 border-t border-line py-4"
                  >
                    <span className="min-w-0">
                      <span className="font-medium transition-colors group-hover:text-accent">
                        {keepsake.title}
                      </span>
                      <span className="ml-3 text-xs text-ink-muted">
                        {keepsake.audience}
                      </span>
                    </span>
                    <span className="shrink-0 text-ink-muted transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5">
                      ↗
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        </Reveal>
      </div>
    </Container>
  );
}
