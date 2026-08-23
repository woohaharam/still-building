/** 기술 스택이나 주요어를 담는 알약 모양 태그. */
export default function Pills({
  items,
  className = 'mt-6',
}: {
  items: string[];
  className?: string;
}) {
  return (
    <ul className={`flex flex-wrap gap-2 ${className}`}>
      {items.map((item) => (
        <li
          key={item}
          className="rounded-full border border-line px-3 py-1 text-xs text-ink-muted"
        >
          {item}
        </li>
      ))}
    </ul>
  );
}
