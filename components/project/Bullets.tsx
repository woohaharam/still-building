/** 점 찍힌 목록. 프로젝트와 논문이 같이 쓴다. */
export default function Bullets({
  items,
  className = 'mt-6',
}: {
  items: string[];
  className?: string;
}) {
  return (
    <ul className={`flex flex-col gap-3 ${className}`}>
      {items.map((item) => (
        <li
          key={item}
          className="flex gap-3 text-sm leading-relaxed text-ink-soft"
        >
          <span
            aria-hidden
            className="mt-2 h-1 w-1 shrink-0 rounded-full bg-ink-muted"
          />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
