export default function ProjectCard({
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
      <p className="mt-2 text-sm leading-relaxed text-ink-soft">
        {description}
      </p>
      <p className="mt-3 text-xs text-ink-muted">{stack}</p>
    </a>
  );
}
