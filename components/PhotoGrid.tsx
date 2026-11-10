'use client';

import { useCallback, useEffect, useState } from 'react';
import { formatDate } from '@/lib/calendar';
import { PhotoWithUrl } from '@/lib/types';

/**
 * 격자로 깔고, 누르면 크게 본다.
 *
 * 사진은 next/image 가 아니라 img 로 그린다. 비공개 사진의 주소는 한 시간마다
 * 달라지는 서명 주소라서, 최적화 서버가 캐시할 수 있는 고정 주소가 아니다.
 * 공개 사진까지 같은 방식으로 두는 건 한 화면에 두 가지 경로가 섞이면
 * 어느 쪽이 느린지 가려내기 어려워서다.
 */
export default function PhotoGrid({ photos }: { photos: PhotoWithUrl[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const close = useCallback(() => setOpenIndex(null), []);

  const step = useCallback(
    (delta: number) =>
      setOpenIndex((current) =>
        current === null
          ? null
          : (current + delta + photos.length) % photos.length
      ),
    [photos.length]
  );

  /*
    크게 보는 동안 키보드로 넘긴다. 마우스가 없는 사람에게는 이게 유일한
    길이고, 있는 사람에게도 화살표가 더 빠르다.

    뒤쪽 화면이 스크롤되지 않게 body 를 잠근다. 잠그지 않으면 사진을 넘기다
    닫았을 때 엉뚱한 자리에 가 있다.
  */
  useEffect(() => {
    if (openIndex === null) return;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
      else if (event.key === 'ArrowRight') step(1);
      else if (event.key === 'ArrowLeft') step(-1);
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [openIndex, close, step]);

  if (photos.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-ink-muted">
        아직 올린 사진이 없어요.
      </p>
    );
  }

  const open = openIndex === null ? null : photos[openIndex];

  return (
    <>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {photos.map((photo, index) => (
          <li key={photo.id}>
            <button
              type="button"
              onClick={() => setOpenIndex(index)}
              className="group block w-full overflow-hidden rounded-lg border border-line bg-surface"
              aria-label={`${photo.title || '사진'} 크게 보기`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo.url}
                alt={photo.title || photo.caption || '사진'}
                loading="lazy"
                className="aspect-square w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
              />
            </button>
          </li>
        ))}
      </ul>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={open.title || '사진'}
          className="fixed inset-0 z-50 flex flex-col bg-black/90 p-4"
          onClick={close}
        >
          <div className="flex justify-end">
            <button
              type="button"
              onClick={close}
              aria-label="닫기"
              className="rounded-full px-3 py-1 text-sm text-white/80 hover:text-white"
            >
              닫기 ✕
            </button>
          </div>

          {/* 사진과 설명은 눌러도 안 닫힌다. 넘기려다 닫히면 성가시다. */}
          <figure
            className="flex min-h-0 flex-1 flex-col items-center justify-center gap-4"
            onClick={(event) => event.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={open.url}
              alt={open.title || open.caption || '사진'}
              className="max-h-full min-h-0 max-w-full object-contain"
            />
            {(open.title || open.caption || open.taken_on) && (
              <figcaption className="max-w-xl text-center text-sm text-white/80">
                {open.title && (
                  <span className="font-medium">{open.title}</span>
                )}
                {open.caption && <p className="mt-1">{open.caption}</p>}
                {open.taken_on && (
                  <p className="mt-1 text-xs text-white/50">
                    {formatDate(open.taken_on)}
                  </p>
                )}
              </figcaption>
            )}
          </figure>

          {photos.length > 1 && (
            <div
              className="flex items-center justify-center gap-6 pt-4 text-sm text-white/80"
              onClick={(event) => event.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => step(-1)}
                aria-label="이전 사진"
              >
                ← 이전
              </button>
              <span className="text-xs text-white/50">
                {(openIndex ?? 0) + 1} / {photos.length}
              </span>
              <button
                type="button"
                onClick={() => step(1)}
                aria-label="다음 사진"
              >
                다음 →
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
}
