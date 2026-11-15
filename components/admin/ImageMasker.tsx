'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  isUsableRect,
  MASK_LABELS,
  pixelSize,
  rectFromPoints,
  toNaturalRect,
  type MaskKind,
  type Rect,
} from '@/lib/mask';

/**
 * 사진의 일부를 가린다. 얼굴이나 차 번호처럼 올리고 나서야 눈에 띄는 것들.
 *
 * 가린 사진은 새 파일로 올리고 본문의 주소를 바꾼다. 원본에 덮어쓰지 않는
 * 건 캐시 때문이다 — 같은 주소에 다른 그림을 올리면 이미 받아간 쪽에는
 * 한동안 가리기 전 사진이 남는다.
 *
 * 대신 원본은 지운다. post-images 는 누구나 읽는 버킷이라 남겨두면 주소를
 * 아는 사람에게 가리기 전 사진이 그대로 보인다 (lib/storage.ts 의
 * deleteImage).
 */
export default function ImageMasker({
  url,
  onDone,
  onCancel,
}: {
  url: string;
  /** 가린 사진을 만들었을 때. 올리고 본문을 고치는 일은 부르는 쪽이 한다. */
  onDone: (blob: Blob) => void;
  onCancel: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  const [kind, setKind] = useState<MaskKind>('pixelate');
  const [rects, setRects] = useState<Rect[]>([]);
  const [dragging, setDragging] = useState<Rect | null>(null);
  const [error, setError] = useState('');
  const [ready, setReady] = useState(false);
  const [working, setWorking] = useState(false);

  /** 화면에 그린다. 원본 위에 지금까지 친 네모를 겹친다. */
  const paint = useCallback(() => {
    const canvas = canvasRef.current;
    const image = imageRef.current;
    if (!canvas || !image) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    context.drawImage(image, 0, 0, canvas.width, canvas.height);

    context.save();
    context.strokeStyle = 'rgba(255,255,255,0.9)';
    context.fillStyle = 'rgba(0,0,0,0.45)';
    context.lineWidth = 2;

    for (const rect of [...rects, dragging].filter(Boolean) as Rect[]) {
      context.fillRect(rect.x, rect.y, rect.width, rect.height);
      context.strokeRect(rect.x, rect.y, rect.width, rect.height);
    }
    context.restore();
  }, [rects, dragging]);

  useEffect(() => {
    const image = new Image();
    /*
      다른 출처(Supabase)의 사진을 캔버스에 그린 뒤 다시 꺼내려면 이게
      있어야 한다. 없으면 캔버스가 '오염된' 것으로 표시돼서, 그리기는
      되는데 toBlob 에서 막힌다. 가린 뒤에야 실패하는 셈이다.
    */
    image.crossOrigin = 'anonymous';

    image.onload = () => {
      imageRef.current = image;
      const canvas = canvasRef.current;
      if (canvas) {
        // 원본 크기 그대로 둔다. 보이는 크기는 CSS 가 줄인다.
        canvas.width = image.naturalWidth;
        canvas.height = image.naturalHeight;
      }
      setReady(true);
    };

    image.onerror = () => {
      setError('사진을 불러오지 못했어요.');
    };

    image.src = url;
  }, [url]);

  useEffect(() => {
    if (ready) paint();
  }, [ready, paint]);

  /** 화면에서 누른 자리를 캔버스 좌표로. 캔버스는 CSS 로 줄여 그려진다. */
  function pointAt(event: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = event.currentTarget;
    const box = canvas.getBoundingClientRect();

    return toNaturalRect(
      {
        x: event.clientX - box.left,
        y: event.clientY - box.top,
        width: 0,
        height: 0,
      },
      { width: box.width, height: box.height },
      { width: canvas.width, height: canvas.height }
    );
  }

  const startRef = useRef<{ x: number; y: number } | null>(null);

  function handleDown(event: React.PointerEvent<HTMLCanvasElement>) {
    event.currentTarget.setPointerCapture(event.pointerId);
    const point = pointAt(event);
    startRef.current = point;
    setDragging({ ...point, width: 0, height: 0 });
  }

  function handleMove(event: React.PointerEvent<HTMLCanvasElement>) {
    if (!startRef.current) return;
    setDragging(rectFromPoints(startRef.current, pointAt(event)));
  }

  function handleUp() {
    if (dragging && isUsableRect(dragging)) {
      setRects((prev) => [...prev, dragging]);
    }
    startRef.current = null;
    setDragging(null);
  }

  /** 네모 안을 실제로 가리고 그림을 꺼낸다. */
  function apply() {
    const canvas = canvasRef.current;
    const image = imageRef.current;
    if (!canvas || !image || rects.length === 0) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    setWorking(true);
    setError('');

    // 테두리 없이 원본부터 다시 그린다. 화면용 표시가 그림에 남으면 안 된다.
    context.drawImage(image, 0, 0, canvas.width, canvas.height);

    for (const rect of rects) {
      if (kind === 'fill') {
        context.fillStyle = '#000';
        context.fillRect(rect.x, rect.y, rect.width, rect.height);
        continue;
      }

      /*
        모자이크는 그 자리를 아주 작게 줄였다가 도로 늘려 만든다. 줄이는
        동안 잃은 정보는 늘려도 돌아오지 않아서, 실제로 지워진다.
        네모를 덮어 그리는 것과 달리 사진에서 떼어낼 수가 없다.
      */
      const block = pixelSize(rect);
      const smallWidth = Math.max(1, Math.round(rect.width / block));
      const smallHeight = Math.max(1, Math.round(rect.height / block));

      context.imageSmoothingEnabled = false;
      context.drawImage(
        canvas,
        rect.x,
        rect.y,
        rect.width,
        rect.height,
        rect.x,
        rect.y,
        smallWidth,
        smallHeight
      );
      context.drawImage(
        canvas,
        rect.x,
        rect.y,
        smallWidth,
        smallHeight,
        rect.x,
        rect.y,
        rect.width,
        rect.height
      );
      context.imageSmoothingEnabled = true;
    }

    canvas.toBlob(
      (blob) => {
        setWorking(false);
        if (!blob) {
          // 다른 출처의 사진이 CORS 를 안 주면 여기서 막힌다.
          setError('가린 사진을 만들지 못했어요. 사진 주소를 확인해주세요.');
          return;
        }
        onDone(blob);
      },
      'image/jpeg',
      0.92
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col gap-3 overflow-auto bg-black/85 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-white">
        <span>가릴 곳을 끌어서 칠해주세요</span>
        <button
          type="button"
          onClick={onCancel}
          className="rounded px-3 py-1 text-white/80 hover:text-white"
        >
          닫기 ✕
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-sm">
        {(Object.keys(MASK_LABELS) as MaskKind[]).map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setKind(value)}
            className={`rounded-full border px-3 py-1 text-xs ${
              kind === value
                ? 'border-white bg-white text-black'
                : 'border-white/40 text-white/80 hover:border-white'
            }`}
          >
            {MASK_LABELS[value]}
          </button>
        ))}

        <span className="text-xs text-white/60">{rects.length}곳</span>

        <button
          type="button"
          onClick={() => setRects((prev) => prev.slice(0, -1))}
          disabled={rects.length === 0}
          className="rounded border border-white/40 px-3 py-1 text-xs text-white/80 disabled:opacity-40"
        >
          되돌리기
        </button>

        <button
          type="button"
          onClick={apply}
          disabled={rects.length === 0 || working}
          className="rounded bg-white px-4 py-1 text-xs font-medium text-black disabled:opacity-40"
        >
          {working ? '만드는 중...' : '가리고 바꾸기'}
        </button>
      </div>

      {error && <p className="text-sm text-red-300">{error}</p>}

      <div className="flex min-h-0 flex-1 items-start justify-center">
        <canvas
          ref={canvasRef}
          onPointerDown={handleDown}
          onPointerMove={handleMove}
          onPointerUp={handleUp}
          className="max-h-full max-w-full cursor-crosshair touch-none bg-white/5"
        />
      </div>
    </div>
  );
}
