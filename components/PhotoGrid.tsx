'use client';

import { useCallback, useEffect, useState } from 'react';
import { formatDate } from '@/lib/calendar';
import { PhotoWithUrl } from '@/lib/types';
import PhotoPrint from './PhotoPrint';

/**
 * 인화물을 깔아두고, 누르면 크게 본다.
 *
 * 한 장씩 뽑아 늘어놓은 것처럼 보이게 PhotoPrint 로 감싼다. 적어둔 글은
 * 크게 보기 전에도 인화지 아래에 보인다 — 그 글을 읽으려고 한 장씩 눌러야
 * 한다면 적어둔 보람이 없다.
 */
/**
 * 버튼에 읽히는 이름.
 *
 * 인화지에 보이는 글을 그대로 담고 끝에 할 일을 붙인다. 보이는 글이 이름에
 * 다 들어가야 음성으로 조작하는 사람이 보이는 말을 불러서 누를 수 있다
 * (WCAG 2.5.3 Label in Name).
 *
 * 처음에는 '사진 크게 보기' 로만 뒀다가 axe 에 걸렸다. 캡션만 넣어도
 * 여전히 걸렸는데, 날짜도 화면에 보이기 때문이다. 일부가 아니라 전부여야
 * 한다. 그래서 PhotoPrint 가 그리는 것과 같은 조각을 같은 순서로 잇는다.
 */
function printLabel(photo: PhotoWithUrl): string {
  const written = photo.title || photo.caption;
  const shown = [written, photo.taken_on && formatDate(photo.taken_on)].filter(
    Boolean
  );

  return [...(shown.length ? shown : ['사진']), '크게 보기'].join(' ');
}

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
      <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5">
        {photos.map((photo, index) => (
          <li key={photo.id}>
            <button
              type="button"
              onClick={() => setOpenIndex(index)}
              className="block h-full w-full text-left transition-transform duration-200 hover:-translate-y-0.5"
            >
              {/*
                맨 앞 여섯 장은 바로 받는다. 첫 화면에 들어오는 것들이라
                lazy 로 두면 스크롤도 하기 전에 빈 칸이 보인다.
              */}
              <PhotoPrint photo={photo} priority={index < 6} />
              {/*
                버튼에 aria-label 을 달지 않는다. 달면 화면에 보이는 글과
                읽히는 이름이 어긋나서, 음성으로 조작하는 사람이 보이는
                말을 불러도 안 눌린다 (WCAG 2.5.3 Label in Name).

                캡션과 날짜를 이름에 옮겨 적어봤지만 띄어쓰기까지 맞추기가
                까다로웠다. 내용으로 이름이 만들어지게 두면 보이는 글이
                그대로 이름이 되므로 어긋날 수가 없다. 할 일만 숨은 글로
                덧붙인다.
              */}
              <span className="sr-only">크게 보기</span>
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
