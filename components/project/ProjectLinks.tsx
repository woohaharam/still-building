import Link from 'next/link';

export default function ProjectLinks({
  links,
  className = 'mt-7',
}: {
  links: { label: string; href: string }[];
  className?: string;
}) {
  const itemClass =
    'group inline-flex items-center gap-2 text-sm text-ink-soft transition-colors hover:text-ink';

  return (
    <div className={`flex flex-wrap gap-5 ${className}`}>
      {links.map((link) =>
        link.href.startsWith('http') ? (
          <a
            key={link.href}
            href={link.href}
            target="_blank"
            rel="noreferrer"
            className={itemClass}
          >
            {link.label}
            <span className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5">
              ↗
            </span>
          </a>
        ) : (
          <Link key={link.href} href={link.href} className={itemClass}>
            {link.label}
            <span className="transition-transform group-hover:translate-x-0.5">
              →
            </span>
          </Link>
        )
      )}
    </div>
  );
}
