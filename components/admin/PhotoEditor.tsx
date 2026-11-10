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
    saveMany,
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
  async function handleUpload(files: File[]) {
    if (files.length === 0) return;

    setUploading(true);
    setStatus('');

    const bucket = album === 'private' ? PRIVATE_BUCKET : PUBLIC_BUCKET;

    try {
      /*
        한 장이면 폼에 담아 제목과 글을 적게 두고, 여러 장이면 바로 넣는다.

        여러 장을 올리면서 글을 한 칸에 적게 하면 그 글이 전부에 똑같이
        붙는다. 사진마다 그날이 다른데 그건 쓸모가 없다. 먼저 넣어두고
        목록에서 한 장씩 골라 적는 쪽이 실제로 하는 순서에 가깝다.
      */
      if (files.length === 1) {
        setImagePath(await uploadPhoto(files[0], bucket));
        return;
      }

      const paths: string[] = [];
      for (const [index, file] of files.entries()) {
        setStatus(`${files.length}장 중 ${index + 1}장 올리는 중...`);
        paths.push(await uploadPhoto(file, bucket));
      }

      const saved = await saveMany(
        paths.map((path) => ({
          album,
          title: null,
          caption: null,
          taken_on: takenOn || null,
          image_path: path,
        }))
      );

      if (saved) {
        setStatus(`${paths.length}장 넣었어요. 목록에서 글을 적을 수 있어요.`);
      }
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
              multiple
              onChange={(e) => {
                void handleUpload(Array.from(e.target.files ?? []));
                // 같은 파일을 다시 골라도 onChange 가 오게 비운다.
                e.target.value = '';
              }}
              className="text-sm text-ink-soft file:mr-3 file:rounded-md file:border file:border-line file:bg-transparent file:px-3 file:py-1.5 file:text-sm file:text-ink-soft"
            />
            <p className="text-xs text-ink-muted">
              여러 장을 한 번에 고를 수 있어요. 두 장 이상이면 글 없이 바로
              들어가고, 목록에서 한 장씩 골라 적으면 돼요.
            </p>
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
