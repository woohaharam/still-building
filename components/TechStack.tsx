import TechMark from './TechMark';
import { techGroups } from '@/lib/tech';

/**
 * 다룰 줄 아는 기술.
 *
 * 칸마다 한 줄씩 늘어놓는다. 한 덩어리로 쏟아두면 열두 개가 다 같은 무게로
 * 보여서, 언어인지 배포 도구인지가 읽는 사람 머릿속에서만 갈린다.
 *
 * compact 는 이력서용이다. 종이에서는 같은 내용이 한 쪽 안에 들어가야 한다.
 */
export default function TechStack({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`flex flex-col ${compact ? 'gap-4' : 'gap-6'}`}>
      {techGroups().map((group) => (
        <div
          key={group.key}
          className={compact ? 'sm:flex sm:gap-6' : undefined}
        >
          <h3
            className={`section-label ${
              compact ? 'w-28 shrink-0 sm:pt-1.5' : 'mb-3'
            }`}
          >
            {group.label}
          </h3>

          <ul
            className={`flex flex-wrap gap-2 ${compact ? 'mt-2 sm:mt-0' : ''}`}
          >
            {group.items.map((tech) => (
              <li
                key={tech.name}
                className="flex items-center gap-2 rounded-full border border-line px-3 py-1.5 text-sm"
              >
                <TechMark tech={tech} />
                {tech.name}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
