'use client';

import { useState } from 'react';
import { uploadImage } from '@/lib/storage';

/**
 * 대표 사진 칸.
 *
 * 글·독후감·여행 세 곳이 같은 일을 한다. 주소를 직접 붙여넣거나 파일을 올리고,
 * 올린 뒤에는 미리보기를 띄운다. 세 곳에 같은 코드가 흩어져 있었고 업로드
 * 핸들러는 글자까지 같았다.
 *
 * 오류 문구 색은 한 곳만 고정 색(text-red-600)을 쓰고 있었다. 그 값은 테마를
 * 안 타서 다크 모드에서 배경과 따로 놀았다. --danger 토큰으로 통일했다.
 */
export default function CoverImageField({
  value,
  onChange,
  placeholder,
  buttonLabel,
  previewAlt,
  previewClassName = 'h-32 w-full',
}: {
  value: string;
  onChange: (url: string) => void;
  placeholder: string;
  buttonLabel: string;
  previewAlt: string;
  /** 표지는 세로로 길고 여행 사진은 가로로 넓어서 크기만 바깥에서 정한다. */
  previewClassName?: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');
    setUploading(true);
    try {
      onChange(await uploadImage(file));
    } catch (err) {
      setError(
        err instanceof Error ? `업로드 실패: ${err.message}` : '업로드 실패'
      );
    } finally {
      setUploading(false);
      // 같은 파일을 다시 골라도 change 가 걸리도록 비운다.
      e.target.value = '';
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-3">
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="min-w-0 flex-1 rounded-md border border-line px-3 py-2 text-sm focus:border-ink-muted focus:outline-none"
        />
        <label className="cursor-pointer whitespace-nowrap rounded-md border border-line px-3 py-2 text-sm text-ink-soft hover:border-ink-muted">
          {uploading ? '올리는 중...' : buttonLabel}
          <input
            type="file"
            accept="image/*"
            onChange={handleUpload}
            className="hidden"
          />
        </label>
      </div>

      {error && <p className="text-xs text-danger">{error}</p>}

      {value && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={value}
          alt={previewAlt}
          className={`${previewClassName} rounded-md border border-line object-cover`}
        />
      )}
    </div>
  );
}
