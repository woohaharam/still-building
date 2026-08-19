'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { TRACKS } from '@/lib/playlist';

const STORAGE_KEY = 'sb_music';

interface YouTubePlayer {
  playVideo(): void;
  pauseVideo(): void;
  loadVideoById(videoId: string): void;
  getVideoData?(): { title?: string } | undefined;
  destroy(): void;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
let apiPromise: Promise<any> | null = null;

/** 유튜브 스크립트는 재생을 누른 순간에만 받아와요. 안 듣는 사람은 한 바이트도 안 씁니다. */
function loadYouTubeApi(): Promise<any> {
  if (apiPromise) return apiPromise;

  apiPromise = new Promise((resolve, reject) => {
    const w = window as any;
    if (w.YT?.Player) {
      resolve(w.YT);
      return;
    }

    const previous = w.onYouTubeIframeAPIReady;
    w.onYouTubeIframeAPIReady = () => {
      previous?.();
      resolve(w.YT);
    };

    const script = document.createElement('script');
    script.src = 'https://www.youtube.com/iframe_api';
    script.async = true;
    script.onerror = () => {
      // 실패한 약속을 캐시해두면 영영 재시도가 안 되니 비워둬요.
      apiPromise = null;
      reject(new Error('유튜브 스크립트를 못 받았어요'));
    };
    document.head.appendChild(script);
  });

  return apiPromise;
}

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
      <path d="M8 5.5v13l11-6.5z" fill="currentColor" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
      <path d="M8.5 5.5h3v13h-3zM12.5 5.5h3v13h-3z" fill="currentColor" />
    </svg>
  );
}

function NoteIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" aria-hidden>
      <path
        d="M9 17.5V7.2l9-1.9v9.6"
        stroke="currentColor"
        strokeWidth="1.7"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="7" cy="17.6" r="2.3" fill="currentColor" />
      <circle cx="16" cy="15.6" r="2.3" fill="currentColor" />
    </svg>
  );
}

export default function MusicPlayer() {
  const pathname = usePathname();

  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [note, setNote] = useState('');
  // 곡 제목은 유튜브에 올라간 걸 그대로 가져와요. 목록에 제목을 안 적어도 되게.
  const [autoTitle, setAutoTitle] = useState('');

  const playerRef = useRef<YouTubePlayer | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const indexRef = useRef(0);
  const errorStreakRef = useRef(0);

  indexRef.current = index;

  const step = useCallback((delta: number) => {
    if (TRACKS.length === 0) return;
    const next = (indexRef.current + delta + TRACKS.length) % TRACKS.length;
    indexRef.current = next;
    setIndex(next);
    setNote('');
    setAutoTitle('');
    playerRef.current?.loadVideoById(TRACKS[next].videoId);
  }, []);

  const readTitle = useCallback((player: YouTubePlayer) => {
    try {
      const title = player.getVideoData?.()?.title;
      if (title) setAutoTitle(title);
    } catch {
      // 제목을 못 읽어도 재생에는 문제 없어요.
    }
  }, []);

  const ensurePlayer = useCallback(async () => {
    if (playerRef.current) return playerRef.current;
    if (!containerRef.current || TRACKS.length === 0) return null;

    let YT;
    try {
      YT = await loadYouTubeApi();
    } catch {
      setNote('유튜브를 못 불러왔어요');
      return null;
    }

    // YT가 이 div를 iframe으로 갈아치우기 때문에, 리액트가 모르는 노드로 만들어서 넘겨요.
    const host = document.createElement('div');
    containerRef.current.appendChild(host);

    const player = new YT.Player(host, {
      width: '1',
      height: '1',
      videoId: TRACKS[indexRef.current].videoId,
      host: 'https://www.youtube-nocookie.com',
      playerVars: { autoplay: 1, controls: 0, playsinline: 1, rel: 0 },
      events: {
        onReady: (event: any) => {
          readTitle(event.target);
          event.target.playVideo();
        },
        onStateChange: (event: any) => {
          // 1 재생중, 2 멈춤, 0 끝남
          if (event.data === 1) {
            errorStreakRef.current = 0;
            readTitle(event.target);
            setPlaying(true);
          } else if (event.data === 2) {
            setPlaying(false);
          } else if (event.data === 0) {
            step(1);
          }
        },
        onError: () => {
          // 퍼가기가 막힌 영상이면 조용히 다음 곡으로 넘어가요.
          errorStreakRef.current += 1;
          if (errorStreakRef.current >= TRACKS.length) {
            setPlaying(false);
            setNote('재생할 수 있는 곡이 없어요');
            return;
          }
          step(1);
        },
      },
    }) as YouTubePlayer;

    playerRef.current = player;
    return player;
  }, [step, readTitle]);

  // 저장해둔 상태 되살리기
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as { open?: boolean; index?: number };
        if (typeof saved.index === 'number' && TRACKS[saved.index]) {
          indexRef.current = saved.index;
          setIndex(saved.index);
        }
        if (saved.open) setOpen(true);
      }
    } catch {
      // 저장된 게 깨져 있으면 그냥 처음부터 시작해요.
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ open, index }));
    } catch {
      // 저장 못 해도 이번 방문 동안은 잘 돌아가요.
    }
  }, [mounted, open, index]);

  // 지난번에 켜둔 채로 나갔으면 다시 틀어봐요.
  // 브라우저가 소리 있는 자동재생을 막으면 그냥 멈춘 채로 남고, 누르면 시작돼요.
  useEffect(() => {
    if (!mounted || !open || playerRef.current) return;
    ensurePlayer();
  }, [mounted, open, ensurePlayer]);

  useEffect(() => {
    return () => {
      playerRef.current?.destroy();
      playerRef.current = null;
    };
  }, []);

  async function handleOpen() {
    setOpen(true);
    const player = await ensurePlayer();
    player?.playVideo();
  }

  async function togglePlay() {
    const player = await ensurePlayer();
    if (!player) return;
    if (playing) {
      player.pauseVideo();
    } else {
      setNote('');
      errorStreakRef.current = 0;
      player.playVideo();
    }
  }

  function handleClose() {
    playerRef.current?.pauseVideo();
    setPlaying(false);
    setOpen(false);
  }

  // 글 쓰는 중에 노래가 따라다니면 방해되니까 관리자 화면에서는 안 띄워요.
  if (TRACKS.length === 0 || pathname?.startsWith('/admin')) return null;

  const track = TRACKS[index];

  return (
    <>
      <div ref={containerRef} aria-hidden className="fixed left-[-9999px] top-0 h-px w-px overflow-hidden" />

      {!mounted ? null : !open ? (
        <button
          onClick={handleOpen}
          aria-label="노래 켜기"
          title="노래 켜기"
          className="fixed bottom-5 right-5 z-40 flex h-11 w-11 items-center justify-center rounded-full border border-line bg-paper text-ink-soft shadow-sm transition-colors hover:text-ink"
        >
          <NoteIcon />
        </button>
      ) : (
        <div className="fixed bottom-5 right-5 z-40 flex items-center gap-1 rounded-full border border-line bg-paper py-1.5 pl-2 pr-1.5 shadow-sm">
          <button
            onClick={() => step(-1)}
            aria-label="이전 곡"
            className="flex h-7 w-7 items-center justify-center rounded-full text-base leading-none text-ink-muted transition-colors hover:text-ink"
          >
            ‹
          </button>

          <button
            onClick={togglePlay}
            aria-label={playing ? '멈추기' : '재생'}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-ink text-paper"
          >
            {playing ? <PauseIcon /> : <PlayIcon />}
          </button>

          <button
            onClick={() => step(1)}
            aria-label="다음 곡"
            className="flex h-7 w-7 items-center justify-center rounded-full text-base leading-none text-ink-muted transition-colors hover:text-ink"
          >
            ›
          </button>

          <span className="mx-1 max-w-[8.5rem] truncate text-xs text-ink-soft sm:max-w-[13rem]">
            {note || track.title || autoTitle || `노래 ${index + 1}`}
          </span>

          <button
            onClick={handleClose}
            aria-label="노래 끄기"
            className="flex h-7 w-7 items-center justify-center rounded-full text-[11px] text-ink-muted transition-colors hover:text-ink"
          >
            ✕
          </button>
        </div>
      )}
    </>
  );
}
