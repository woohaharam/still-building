import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import Container from '@/components/Container';
import Reveal from '@/components/Reveal';
import { skillsFromProjects } from '@/lib/skills';
import {
  education,
  siteAuthor,
  siteAuthorAlias,
  siteEmail,
  siteGithub,
  siteInstagram,
  siteInstagramHandle,
  siteUrl,
} from '@/lib/site';

export const metadata: Metadata = {
  title: '소개',
  description: `${siteAuthor}(${siteAuthorAlias}) — 필요한 걸 직접 만들고, 만들면서 배운 걸 기록합니다.`,
  alternates: { canonical: `${siteUrl}/about` },
};

const NOW = [
  '이 블로그를 처음부터 만들면서 웹을 배우고 있어요. 화면 그리는 쪽보다 데이터가 오가는 쪽에서 훨씬 자주 막힙니다. 그쪽이 더 재밌기도 하고요.',
  '막힌 건 그때그때 글로 남깁니다. 반년 뒤의 제가 같은 데서 또 막힐 게 뻔해서요.',
];

/**
 * 아직 프로젝트에 올릴 만큼 쓰지 못한 것들. 이건 손으로 적는다.
 * 쓴 기술 목록은 반대로 프로젝트에서 뽑는다 (lib/skills.ts).
 */
const LEARNING = ['테스트 작성', '접근성', '검색엔진 최적화'];

export default function AboutPage() {
  const skills = skillsFromProjects();

  return (
    <Container>
      <div className="flex flex-col gap-20 pb-6">
        <section className="flex flex-col gap-8 sm:flex-row sm:items-start sm:gap-10">
          <Image
            src="/profile.jpg"
            alt={`${siteAuthor} 프로필 사진`}
            width={750}
            height={1000}
            priority
            className="h-auto w-[124px] shrink-0 rounded-2xl border border-line object-cover sm:w-[168px]"
          />
          <div>
            <h1 className="mt-4 text-3xl font-bold tracking-tight">
              {siteAuthor}
              <span className="ml-3 text-lg font-medium text-ink-muted">
                {siteAuthorAlias}
              </span>
            </h1>
            <p className="mt-5 leading-relaxed text-ink-soft">
              필요한 걸 직접 만들고, 만들다 막힌 지점을 남깁니다. 잘 굴러가게
              만드는 것보다 왜 그렇게 굴러가는지 아는 쪽에 관심이 있어요.
            </p>

            <Link
              href="/resume"
              className="group mt-7 inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-paper transition-opacity hover:opacity-90"
            >
              이력서 보기
              <span className="transition-transform group-hover:translate-x-0.5">
                →
              </span>
            </Link>
          </div>
        </section>

        <Reveal>
          <section>
            <h2 className="section-label mb-6">요즘</h2>
            <div className="flex flex-col gap-4">
              {NOW.map((line) => (
                <p key={line} className="leading-relaxed text-ink-soft">
                  {line}
                </p>
              ))}
            </div>
          </section>
        </Reveal>

        <Reveal>
          <section>
            <h2 className="section-label mb-6">학력</h2>
            <div className="border-t border-line pt-5">
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <h3 className="text-lg font-semibold">
                  {education.school}{' '}
                  <span className="font-medium text-ink-soft">
                    {education.major}
                  </span>
                </h3>
                <span className="text-sm tabular-nums text-ink-muted">
                  학점 {education.gpa}
                </span>
              </div>
              <p className="mt-2 text-sm text-ink-muted">
                {education.majorEnglish}
              </p>
            </div>
          </section>
        </Reveal>

        <Reveal>
          <section>
            <h2 className="section-label mb-4">기술</h2>
            <p className="mb-6 text-sm leading-relaxed text-ink-soft">
              이름만 적어두면 어디까지 해봤는지는 알 수 없어서, 실제로 쓴
              프로젝트를 옆에 같이 적습니다. 목록은 프로젝트 데이터에서 뽑으므로
              쓴 적 없는 이름이 올라올 자리가 없습니다.
            </p>

            <ul className="flex flex-col">
              {skills.map((skill) => (
                <li
                  key={skill.name}
                  className="flex flex-wrap items-baseline gap-x-4 gap-y-1 border-t border-line py-3.5 last:border-b"
                >
                  <span className="font-medium">{skill.name}</span>
                  <span className="ml-auto text-xs text-ink-muted">
                    {skill.projects.map((project, i) => (
                      <span key={project.slug}>
                        {i > 0 && <span className="mx-1.5 opacity-50">·</span>}
                        <Link
                          href={`/projects/${project.slug}`}
                          className="transition-colors hover:text-accent"
                        >
                          {project.title}
                        </Link>
                      </span>
                    ))}
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-7 sm:flex sm:gap-8">
              <span className="w-24 shrink-0 text-sm text-ink-muted">
                배우는 중
              </span>
              <div className="mt-2 flex flex-wrap gap-2 sm:mt-0">
                {LEARNING.map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-line px-3 py-1 text-xs text-ink-soft"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </section>
        </Reveal>

        <Reveal>
          <section>
            <h2 className="section-label mb-6">연락</h2>
            <div className="flex flex-col">
              <a
                href={`mailto:${siteEmail}`}
                className="group flex items-center justify-between border-b border-line py-5"
              >
                <span className="font-medium transition-colors group-hover:text-accent">
                  {siteEmail}
                </span>
                <span className="text-ink-muted transition-transform group-hover:translate-x-0.5">
                  →
                </span>
              </a>
              <a
                href={siteGithub}
                target="_blank"
                rel="noreferrer"
                className="group flex items-center justify-between border-b border-line py-5"
              >
                <span className="font-medium transition-colors group-hover:text-accent">
                  github.com/woohaharam
                </span>
                <span className="text-ink-muted transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5">
                  ↗
                </span>
              </a>
              <a
                href={siteInstagram}
                target="_blank"
                rel="noreferrer"
                className="group flex items-center justify-between border-b border-line py-5"
              >
                <span className="font-medium transition-colors group-hover:text-accent">
                  인스타그램 {siteInstagramHandle}
                </span>
                <span className="text-ink-muted transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5">
                  ↗
                </span>
              </a>
            </div>

            <Link
              href="/projects"
              className="group mt-8 inline-flex items-center gap-2 text-sm text-ink-soft transition-colors hover:text-ink"
            >
              만든 것들 보기
              <span className="transition-transform group-hover:translate-x-0.5">
                →
              </span>
            </Link>
          </section>
        </Reveal>
      </div>
    </Container>
  );
}
