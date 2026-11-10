'use client';

import { useState } from 'react';
import { openPrivatePhotos } from '@/lib/photos';
import { PhotoWithUrl } from '@/lib/types';
import PhotoGrid from './PhotoGrid';

/**
 * 비공개 사진첩 앞의 잠금.
 *
 * 일기(DiaryGate)와 같은 모양이되 대조하는 곳이 다르다. 일기는 브라우저가
 * DB 함수를 바로 부르고, 사진은 서버를 거친다 — 비공개 버킷의 임시 주소를
 * 발급하려면 브라우저에 둘 수 없는 키가 필요하기 때문이다.
 */
export default function PhotoGate() {
  const [password, setPassword] = useState('');
  const [photos, setPhotos] = useState<PhotoWithUrl[] | null>(null);
  const [error, setError] = useState('');
  const [checking, setChecking] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!password.trim()) return;

    setChecking(true);
    setError('');
    try {
      setPhotos(await openPrivatePhotos(password));
    } catch (err) {
      setError(err instanceof Error ? err.message : '열지 못했어요.');
    } finally {
      setChecking(false);
      setPassword('');
    }
  }

  if (photos) {
    return (
      <>
        <PhotoGrid photos={photos} />
        {photos.length > 0 && (
          <p className="mt-8 text-xs text-ink-muted">
            사진 주소는 한 시간 뒤에 만료돼요. 그 뒤에는 새로고침하고 다시
            열어주세요.
          </p>
        )}
      </>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-sm">
      <label htmlFor="photo-password" className="block text-sm text-ink-soft">
        비밀번호
      </label>
      <div className="mt-2 flex gap-2">
        <input
          id="photo-password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="off"
          className="min-w-0 flex-1 rounded-md border border-line bg-transparent px-3 py-2 text-sm focus:border-ink-muted focus:outline-none"
        />
        <button
          type="submit"
          disabled={checking || !password.trim()}
          className="shrink-0 rounded-md bg-ink px-4 py-2 text-sm font-medium text-paper disabled:opacity-50"
        >
          {checking ? '확인 중...' : '열기'}
        </button>
      </div>
      {error && <p className="mt-3 text-sm text-danger">{error}</p>}
    </form>
  );
}
