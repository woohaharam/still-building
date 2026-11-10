'use client';

import { useState } from 'react';
import { seoulDateKey } from '@/lib/calendar';
import { PRIVATE_BUCKET, PUBLIC_BUCKET } from '@/lib/buckets';
import { publicPhotoUrl } from '@/lib/photos';
import { uploadPhoto } from '@/lib/storage';
import { Photo, PhotoAlbum } from '@/lib/types';
import { useAdminCollection } from '@/lib/use-admin-collection';
import AdminList from './AdminList';

const ALBUMS: [PhotoAlbum, string][] = [
  ['public', '공개'],
  ['private', '비공개'],
];

export default function PhotoEditor() {
  const {
    items: photos,
    loading,
    editingId,
    setEditingId,
    saving,
    status,
    setStatus,
    save,
    remove,
  } = useAdminCollection<Photo>('photos', { column: 'taken_on' });

  const [album, setAlbum] = useState<PhotoAlbum>('public');
  const [title, setTitle] = useState('');
  const [caption, setCaption] = useState('');
  const [takenOn, setTakenOn] = useState(seoulDateKey);
  const [imagePath, setImagePath] = useState('');
  const [uploading, setUploading] = useState(false);

  function resetForm() {
    setEditingId(null);
    setAlbum('public');
    setTitle('');
    setCaption('');
    setTakenOn(seoulDateKey());
    setImagePath('');
  }

  function loadIntoForm(photo: Photo) {
    setEditingId(photo.id);
    setAlbum(photo.album);
    setTitle(photo.title || '');
    setCaption(photo.caption || '');
    setTakenOn(photo.taken_on || '');
    setImagePath(photo.image_path);
    setStatus('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /**
   * 고른 앨범에 따라 들어가는 버킷이 다르다. 비공개 사진이 공개 버킷에
   * 들어가면 목록을 숨겨도 파일은 다 보인다 (supabase/15-photos.sql).
   *
   * 그래서 앨범을 먼저 고르고 올려야 한다. 올린 뒤에 앨범만 바꾸면 파일은
   * 그대로 남아서, 아래에서 그 경우를 막는다.
   */
  async function handleUpload(file: File) {
    setUploading(true);
    setStatus('');
    try {
      const bucket = album === 'private' ? PRIVATE_BUCKET : PUBLIC_BUCKET;
      setImagePath(await uploadPhoto(file, bucket));
    } catch (err) {
      setStatus(
        err instanceof Error
          ? `올리지 못했어요: ${err.message}`
          : '올리지 못했어요'
      );
    } finally {
      setUploading(false);
    }
  }

  async function handleSave() {
    if (!imagePath) {
      setStatus('사진을 먼저 올려주세요.');
      return;
    }

    const saved = await save({
      album,
      title: title.trim() || null,
      caption: caption.trim() || null,
      taken_on: takenOn || null,
      image_path: imagePath,
    });

    if (saved) resetForm();
  }

  /*
    앨범을 바꾸면 올려둔 사진을 떼어낸다.

    파일은 버킷에 이미 들어가 있어서, 앨범만 바꾸면 공개 버킷에 있는 파일이
    비공개 사진으로 적힌다. 행은 숨지만 파일은 그대로 보이는 상태가 된다.
    다시 올리게 하는 편이 안전하다.
  */
  function changeAlbum(next: PhotoAlbum) {
    setAlbum(next);
    if (imagePath && next !== album) {
      setImagePath('');
      setStatus('앨범이 바뀌어서 사진을 다시 올려야 해요.');
    }
  }

  return (
    <div className="grid gap-10 md:grid-cols-[1fr_320px]">
      <div>
        <h1 className="mb-6 text-xl font-bold">
          {editingId ? '사진 수정' : '새 사진'}
        </h1>

        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2">
            {ALBUMS.map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => changeAlbum(value)}
                className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                  album === value
                    ? 'border-ink bg-ink text-paper'
                    : 'border-line text-ink-soft hover:border-ink-muted'
                }`}
              >
                {label}
              </button>
            ))}
            <span className="text-xs text-ink-muted">
              {album === 'private'
                ? '비밀번호를 아는 사람만 봐요'
                : '누구나 볼 수 있어요'}
            </span>
          </div>

          <div className="flex flex-col gap-2">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void handleUpload(file);
                e.target.value = '';
              }}
              className="text-sm text-ink-soft file:mr-3 file:rounded-md file:border file:border-line file:bg-transparent file:px-3 file:py-1.5 file:text-sm file:text-ink-soft"
            />
            {uploading && (
              <p className="text-sm text-ink-muted">올리는 중...</p>
            )}
            {imagePath && !uploading && (
              <p className="text-xs text-ink-muted">
                올라갔어요 · {album === 'private' ? '비공개 버킷' : '공개 버킷'}
              </p>
            )}
            {imagePath && album === 'public' && (
              // 비공개 사진은 여기서 미리 못 본다. 주소에 서명이 필요한데
              // 그건 서버만 할 수 있다.
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={publicPhotoUrl(imagePath)}
                alt="올린 사진"
                className="mt-1 h-40 w-40 rounded-md border border-line object-cover"
              />
            )}
          </div>

          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="제목 (없어도 돼요)"
            className="rounded-md border border-line px-3 py-2 text-sm focus:border-ink-muted focus:outline-none"
          />

          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="설명 (없어도 돼요)"
            rows={3}
            className="rounded-md border border-line px-3 py-2 text-sm focus:border-ink-muted focus:outline-none"
          />

          <label className="flex items-center gap-3 text-sm text-ink-soft">
            찍은 날
            <input
              type="date"
              value={takenOn}
              onChange={(e) => setTakenOn(e.target.value)}
              className="rounded-md border border-line px-3 py-2 text-sm focus:border-ink-muted focus:outline-none"
            />
          </label>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || uploading}
              className="rounded-md bg-ink px-4 py-2 text-sm font-medium text-paper disabled:opacity-50"
            >
              {saving ? '저장 중...' : editingId ? '수정' : '추가'}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="text-sm text-ink-muted hover:text-ink-soft"
              >
                취소
              </button>
            )}
            {status && <span className="text-sm text-ink-muted">{status}</span>}
          </div>
        </div>
      </div>

      <AdminList
        title={`사진 ${photos.length}장`}
        items={photos}
        loading={loading}
        onEdit={loadIntoForm}
        onRemove={(photo) => remove(photo.id, '이 사진을 지울까요?')}
      >
        {(photo) => (
          <div className="flex items-center gap-3">
            {photo.album === 'public' ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={publicPhotoUrl(photo.image_path)}
                alt=""
                className="h-10 w-10 shrink-0 rounded border border-line object-cover"
              />
            ) : (
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded border border-line text-xs text-ink-muted">
                비공개
              </span>
            )}
            <span className="min-w-0 flex-1 truncate text-sm">
              {photo.title || photo.caption || photo.taken_on || '사진'}
            </span>
          </div>
        )}
      </AdminList>
    </div>
  );
}
