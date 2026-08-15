'use client';

import { PostTag, TAG_LABELS } from '@/lib/types';

interface TagFilterProps {
  active: PostTag | 'all';
  onChange: (tag: PostTag | 'all') => void;
  counts: Record<string, number>;
}

const TAGS: (PostTag | 'all')[] = ['all', 'tech', 'life', 'retrospective'];

export default function TagFilter({ active, onChange, counts }: TagFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {TAGS.map((tag) => {
        const label = tag === 'all' ? '전체' : TAG_LABELS[tag];
        const isActive = active === tag;
        return (
          <button
            key={tag}
            onClick={() => onChange(tag)}
            className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
              isActive
                ? 'bg-ink text-paper border-ink'
                : 'border-line text-ink-soft hover:border-ink-muted'
            }`}
          >
            {label}
            {counts[tag] !== undefined && (
              <span className="ml-1.5 opacity-60">{counts[tag]}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
