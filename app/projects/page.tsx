import type { Metadata } from 'next';
import Link from 'next/link';
import Container from '@/components/Container';
import Reveal from '@/components/Reveal';
import { PROJECTS } from '@/lib/projects';
import { siteUrl } from '@/lib/site';

export const metadata: Metadata = {
  title: '프로젝트',
  description: '직접 만든 것들과, 만들면서 부딪힌 것들.',
  alternates: { canonical: `${siteUrl}/projects` },
};

export default function ProjectsPage() {
  return (
    <Container>
      <div className="flex flex-col gap-16 pb-6">
        <section>
          <p className="text-xs tracking-[0.22em] text-ink-muted">PROJECTS</p>
          <h1 className="mt-4 text-3xl font-bold tracking-tight">만든 것들</h1>
          <p className="mt-5 leading-relaxed text-ink-soft">
            필요해서 만들었고, 만들면서 막힌 것들을 적어뒀어요.
          </p>
        </section>

        <div className="flex flex-col gap-14">
          {PROJECTS.map((project) => (
            <Reveal key={project.slug}>
              <article className="border-t border-line pt-10">
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <h2 className="text-2xl font-bold tracking-tight">
                    {project.title}
                  </h2>
                  <span className="text-xs tabular-nums text-ink-muted">
                    {project.period}
                  </span>
                </div>

                <p className="mt-4 leading-relaxed text-ink-soft">
                  {project.summary}
                </p>

                <ul className="mt-7 flex flex-col gap-3">
                  {project.details.map((detail) => (
                    <li
                      key={detail}
                      className="flex gap-3 text-sm leading-relaxed text-ink-soft"
                    >
                      <span aria-hidden className="mt-2 h-1 w-1 shrink-0 rounded-full bg-ink-muted" />
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>

                <ul className="mt-7 flex flex-wrap gap-2">
                  {project.stack.map((tech) => (
                    <li
                      key={tech}
                      className="rounded-full border border-line px-3 py-1 text-xs text-ink-muted"
                    >
                      {tech}
                    </li>
                  ))}
                </ul>

                <div className="mt-7 flex flex-wrap gap-5">
                  {project.links.map((link) => {
                    const external = link.href.startsWith('http');
                    const className =
                      'group inline-flex items-center gap-2 text-sm text-ink-soft transition-colors hover:text-ink';

                    return external ? (
                      <a
                        key={link.href}
                        href={link.href}
                        target="_blank"
                        rel="noreferrer"
                        className={className}
                      >
                        {link.label}
                        <span className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5">
                          ↗
                        </span>
                      </a>
                    ) : (
                      <Link key={link.href} href={link.href} className={className}>
                        {link.label}
                        <span className="transition-transform group-hover:translate-x-0.5">
                          →
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </Container>
  );
}
