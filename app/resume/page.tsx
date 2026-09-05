import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Container from '@/components/Container';
import JsonLd from '@/components/JsonLd';
import PrintButton from '@/components/PrintButton';
import Bullets from '@/components/project/Bullets';
import { periodLabel } from '@/lib/activity';
import { getActivities } from '@/lib/activities';
import { PROJECTS } from '@/lib/projects';
import { PUBLICATIONS } from '@/lib/publications';
import {
  bareUrl,
  externalLinks,
  militaryService,
  resumeActivities,
} from '@/lib/resume';
import { skillsFromProjects } from '@/lib/skills';
import {
  education,
  siteAuthor,
  siteAuthorAlias,
  siteEmail,
  siteGithub,
  siteUrl,
} from '@/lib/site';
import { ACTIVITY_OUTCOME_LABELS } from '@/lib/types';

export const revalidate = 0;

export const metadata: Metadata = {
  title: '이력서',
  description: `${siteAuthor}(${siteAuthorAlias})의 이력서. 학력·병역·기술·프로젝트·논문·대외활동을 한 장으로.`,
  alternates: { canonical: `${siteUrl}/resume` },
};

/** 왼쪽에 항목 이름, 오른쪽에 내용. 이력서 서식 그대로. */
function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <section className="print-keep border-t border-line pt-6 sm:flex sm:gap-10">
      <h2 className="section-label w-24 shrink-0">{label}</h2>
      <div className="mt-3 min-w-0 flex-1 sm:mt-0">{children}</div>
    </section>
  );
}

/** 기간·역할처럼 짧은 사실을 가운뎃점으로 이어 한 줄에. */
function Facts({ items }: { items: (string | undefined | null)[] }) {
  const shown = items.filter(Boolean) as string[];
  if (shown.length === 0) return null;
  return <p className="mt-1.5 text-xs text-ink-muted">{shown.join(' · ')}</p>;
}

export default async function ResumePage() {
  const activities = resumeActivities(await getActivities());
  const skills = skillsFromProjects();
  const military = militaryService();

  return (
    <Container wide>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Person',
          name: siteAuthor,
          alternateName: siteAuthorAlias,
          url: `${siteUrl}/resume`,
          email: siteEmail,
          sameAs: [siteGithub],
          alumniOf: {
            '@type': 'CollegeOrUniversity',
            name: education.school,
          },
          knowsAbout: skills.map((skill) => skill.name),
        }}
      />

      <article className="flex flex-col gap-8 pb-6">
        <header className="print-keep">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                {siteAuthor}
                <span className="ml-3 text-lg font-medium text-ink-muted">
                  {siteAuthorAlias}
                </span>
              </h1>
              <p className="mt-3 leading-relaxed text-ink-soft">
                필요한 걸 직접 만들고, 만들다 막힌 지점을 남깁니다. 잘 굴러가게
                만드는 것보다 왜 그렇게 굴러가는지 아는 쪽에 관심이 있습니다.
              </p>
            </div>
            <PrintButton />
          </div>

          <p className="mt-5 flex flex-wrap gap-x-3 gap-y-1 text-sm text-ink-soft">
            <a href={`mailto:${siteEmail}`} className="hover:text-accent">
              {siteEmail}
            </a>
            <span aria-hidden className="text-ink-muted opacity-50">
              ·
            </span>
            <a href={siteGithub} className="hover:text-accent">
              {bareUrl(siteGithub)}
            </a>
            <span aria-hidden className="text-ink-muted opacity-50">
              ·
            </span>
            <a href={siteUrl} className="hover:text-accent">
              {bareUrl(siteUrl)}
            </a>
          </p>
        </header>

        <Row label="학력">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <h3 className="font-semibold">
              {education.school}{' '}
              <span className="font-medium text-ink-soft">
                {education.major}
              </span>
            </h3>
            <span className="text-xs tabular-nums text-ink-muted">
              학점 {education.gpa}
            </span>
          </div>
          <p className="mt-1.5 text-xs text-ink-muted">
            {education.majorEnglish}
          </p>
        </Row>

        <Row label="병역">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <h3 className="font-semibold">
              {military.branch}{' '}
              <span className="font-medium text-ink-soft">
                {military.status}
              </span>
            </h3>
            <span className="text-xs tabular-nums text-ink-muted">
              {military.period}
            </span>
          </div>
        </Row>

        <Row label="기술">
          {/*
            기술 이름을 손으로 나열하지 않고 프로젝트 스택에서 뽑는다. 어디에
            썼는지가 옆에 같이 나오므로, 써본 적 없는 이름은 애초에 올라올
            자리가 없다.
          */}
          {/* 한 줄에 하나씩 쌓으면 오른쪽 절반이 빈 채로 종이 한 쪽을 더 먹는다. */}
          <ul className="grid gap-x-8 gap-y-2.5 sm:grid-cols-2">
            {skills.map((skill) => (
              <li
                key={skill.name}
                className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5 text-sm"
              >
                <span className="font-medium">{skill.name}</span>
                <span className="text-xs text-ink-muted">
                  {skill.projects.map((project) => project.title).join(' · ')}
                </span>
              </li>
            ))}
          </ul>
        </Row>

        <Row label="프로젝트">
          <div className="flex flex-col gap-8">
            {PROJECTS.map((project) => {
              const links = externalLinks(project.links);

              return (
                <article key={project.slug} className="print-keep">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                    <h3 className="text-lg font-semibold tracking-tight">
                      {project.title}
                    </h3>
                    <span className="text-xs tabular-nums text-ink-muted">
                      {project.period}
                    </span>
                  </div>

                  <Facts
                    items={[
                      project.role,
                      project.team && `개발 인원 ${project.team}`,
                    ]}
                  />

                  {/*
                    기여도는 '100%' 처럼 짧기도 하고 맡은 범위를 그대로 적기도
                    한다. 위 한 줄에 같이 붙이면 뒤가 길 때 줄이 넘쳐서
                    기간·역할이 묻힌다. 그래서 따로 뺀다.
                  */}
                  {project.contribution && (
                    <p className="mt-1 text-xs text-ink-muted">
                      기여도 {project.contribution}
                    </p>
                  )}

                  <p className="mt-3 text-sm leading-relaxed text-ink-soft">
                    {project.summary}
                  </p>

                  {project.impact && (
                    <Bullets items={project.impact} className="mt-3" />
                  )}

                  <p className="mt-3 text-xs text-ink-muted">
                    {project.stack.join(' · ')}
                  </p>

                  {links.length > 0 && (
                    <ul className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs">
                      {links.map((link) => (
                        <li key={link.href}>
                          <a
                            href={link.href}
                            className="text-ink-muted underline underline-offset-2 hover:text-accent"
                          >
                            {bareUrl(link.href)}
                          </a>
                        </li>
                      ))}
                    </ul>
                  )}
                </article>
              );
            })}
          </div>
        </Row>

        {PUBLICATIONS.length > 0 && (
          <Row label="논문">
            <div className="flex flex-col gap-6">
              {PUBLICATIONS.map((paper) => (
                <article key={paper.slug} className="print-keep">
                  <h3 className="font-semibold leading-snug">{paper.title}</h3>

                  <p className="mt-1.5 text-xs text-ink-muted">
                    {paper.authors.map((author, i) => (
                      <span key={author}>
                        {i > 0 && ' · '}
                        <span
                          className={
                            author === paper.me ? 'font-semibold text-ink' : ''
                          }
                        >
                          {author}
                        </span>
                      </span>
                    ))}
                  </p>

                  <Facts items={[paper.role, paper.venue, paper.period]} />

                  <p className="mt-3 text-sm leading-relaxed text-ink-soft">
                    {paper.summary}
                  </p>

                  <p className="mt-2 text-xs text-ink-muted">
                    {paper.keywords.join(' · ')}
                  </p>
                </article>
              ))}
            </div>
          </Row>
        )}

        {activities.length > 0 && (
          <Row label="대외활동">
            {/* 지원만 하고 끝난 것은 lib/resume.ts 에서 걸러진다. */}
            <ul className="flex flex-col gap-3">
              {activities.map((activity) => (
                <li
                  key={activity.id}
                  className="print-keep flex flex-wrap items-baseline gap-x-3 gap-y-1 text-sm"
                >
                  <span className="font-medium">{activity.name}</span>
                  <span className="text-xs text-ink-muted">
                    {[
                      activity.organizer,
                      ACTIVITY_OUTCOME_LABELS[activity.outcome],
                    ]
                      .filter(Boolean)
                      .join(' · ')}
                  </span>
                  <span className="ml-auto text-xs tabular-nums text-ink-muted">
                    {periodLabel(activity)}
                  </span>
                </li>
              ))}
            </ul>
          </Row>
        )}

        <p className="border-t border-line pt-6 text-xs leading-relaxed text-ink-muted">
          이 이력서는 사이트에 적어둔 프로젝트·논문·활동 데이터를 그대로 읽어
          만듭니다. 따로 관리하는 문서가 없어서 사이트와 내용이 어긋나지
          않습니다. 각 프로젝트의 구조도와 트러블슈팅은{' '}
          <a
            href={`${siteUrl}/projects`}
            className="underline underline-offset-2 hover:text-accent"
          >
            {bareUrl(siteUrl)}/projects
          </a>{' '}
          에 있습니다.
        </p>
      </article>
    </Container>
  );
}
