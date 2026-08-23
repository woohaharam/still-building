import Link from 'next/link';

/**
 * 되돌아가는 링크. ProjectLinks는 뒤에 화살표를 붙이기 때문에
 * '← 목록'에 그대로 쓰면 양쪽에 화살표가 생긴다.
 */
export default function BackLink({
  href,
  label,
}: {
  href: string;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="group inline-flex items-center gap-2 text-sm text-ink-muted transition-colors hover:text-ink-soft"
    >
      <span className="transition-transform group-hover:-translate-x-0.5">
        ←
      </span>
      {label}
    </Link>
  );
}
