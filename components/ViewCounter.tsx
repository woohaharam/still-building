'use client';

import { useEffect } from 'react';
import { countView } from '@/lib/stats';

/** 글을 열면 조회수를 한 번 올린다. 화면에 그리는 건 없다. */
export default function ViewCounter({ slug }: { slug: string }) {
  useEffect(() => {
    countView(slug);
  }, [slug]);

  return null;
}
