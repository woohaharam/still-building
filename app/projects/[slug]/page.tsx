import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Container from '@/components/Container';
import Reveal from '@/components/Reveal';
import ArchitectureDiagram from '@/components/project/ArchitectureDiagram';
import Bullets from '@/components/project/Bullets';
import Pills from '@/components/project/Pills';
import BackLink from '@/components/project/BackLink';
import ProjectLinks from '@/components/project/ProjectLinks';
import TroubleCard from '@/components/project/TroubleCard';
import { PROJECTS, getProject } from '@/lib/projects';
import { siteUrl } from '@/lib/site';

/**
 * 프로젝트 목록은 빌드 시점에 다 안다. 여기 없는 주소는 Next가 곧바로
 * 404로 돌려보냅니다. notFound()에 맡기면 응답 코드가 200으로 나가서
 * 검색엔진이 "내용 없는 페이지"로 색인해 버린다.
 */
export const dynamicParams = false;

export function generateStaticParams() {
  return PROJECTS.map((project) => ({ slug: project.slug }));
}

export function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Metadata {
  const project = getProject(params.slug);
  if (!project) return { title: '프로젝트를 찾을 수 없어요' };

  return {
    title: project.title,
    description: project.summary,
    alternates: { canonical: `${siteUrl}/projects/${project.slug}` },
    openGraph: {
      title: project.title,
      description: project.summary,
      url: `${siteUrl}/projects/${project.slug}`,
      type: 'article',
    },
  };
}

/** 기간 · 인원 · 기여도 · 역할을 표처럼 보여줘요. */
function Overview({
  rows,
}: {
  rows: { label: string; value: string | undefined }[];
}) {
  const shown = rows.filter((row) => row.value);

  return (
    <dl className="flex flex-col">
      {shown.map((row) => (
        <div
          key={row.label}
          className="flex gap-6 border-b border-line py-3 text-sm"
        >
          <dt className="w-20 shrink-0 text-ink-muted">{row.label}</dt>
          <dd className="text-ink-soft">{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}

function Section({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Reveal>
      <section>
        <p className="text-xs tracking-[0.22em] text-ink-muted">{eyebrow}</p>
        <h2 className="mb-8 mt-3 text-xl font-bold tracking-tight">{title}</h2>
        {children}
      </section>
    </Reveal>
  );
}

export default function ProjectDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const project = getProject(params.slug);
  if (!project) notFound();

  const { title, period, role, team, contribution, summary } = project!;

  return (
    <Container wide>
      <div className="flex flex-col gap-16 pb-6">
        <section>
          <div className="mb-8">
            <BackLink href="/projects" label="프로젝트 목록" />
          </div>

          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          <p className="mt-5 max-w-2xl leading-relaxed text-ink-soft">
            {summary}
          </p>

          <div className="mt-8">
            <Overview
              rows={[
                { label: '기간', value: period },
                { label: '개발 인원', value: team },
                { label: '맡은 역할', value: role },
                { label: '기여도', value: contribution },
              ]}
            />
          </div>

          <Pills items={project!.stack} className="mt-6" />
          <ProjectLinks links={project!.links} />
        </section>

        {project!.impact && project!.impact.length > 0 && (
          <Section eyebrow="RESULT" title="숫자로 남은 것">
            <Bullets items={project!.impact} className="mt-0" />
          </Section>
        )}

        {project!.architecture && (
          <Section eyebrow="ARCHITECTURE" title="구조와 데이터 흐름">
            <ArchitectureDiagram architecture={project!.architecture} />
          </Section>
        )}

        {project!.features && project!.features.length > 0 && (
          <Section eyebrow="FEATURES" title="직접 설계하고 구현한 것">
            <div className="flex flex-col gap-8">
              {project!.features.map((feature) => (
                <div key={feature.title} className="border-t border-line pt-6">
                  <h3 className="font-semibold">{feature.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-ink-soft">
                    {feature.body}
                  </p>
                </div>
              ))}
            </div>
          </Section>
        )}

        {project!.troubles && project!.troubles.length > 0 && (
          <Section eyebrow="TROUBLESHOOTING" title="막혔던 것과 푼 방법">
            <div className="flex flex-col gap-6">
              {project!.troubles.map((trouble, i) => (
                <TroubleCard key={trouble.title} trouble={trouble} index={i} />
              ))}
            </div>
          </Section>
        )}
      </div>
    </Container>
  );
}
