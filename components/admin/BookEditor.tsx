'use client';

import { useEffect, useState } from 'react';
import { supabaseClient } from '@/lib/supabase';
import { toDateKey } from '@/lib/calendar';
import { isRating, stars } from '@/lib/rating';
import { toSlug } from '@/lib/slug';
import { uploadImage } from '@/lib/storage';
import { Book, MAX_RATING } from '@/lib/types';

const RATINGS = Array.from({ length: MAX_RATING }, (_, i) => i + 1);

export default function BookEditor() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState('');

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [author, setAuthor] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [rating, setRating] = useState<number | null>(null);
  const [review, setReview] = useState('');
  const [finishedAt, setFinishedAt] = useState('');
  const [published, setPublished] = useState(false);

  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  async function loadBooks() {
    setLoading(true);
    const { data, error } = await supabaseClient
      .from('books')
      .select('*')
      .order('finished_at', { ascending: false, nullsFirst: false });
    if (!error && data) setBooks(data as Book[]);
    setLoading(false);
  }

  useEffect(() => {
    // 기본값은 오늘 — 서버와 브라우저의 시간대 차이를 피하려고 마운트 후에 채운다.
    setFinishedAt(toDateKey(new Date()));
    loadBooks();
  }, []);

  function resetForm() {
    setEditingId(null);
    setTitle('');
    setSlug('');
    setAuthor('');
    setCoverImageUrl('');
    setRating(null);
    setReview('');
    setFinishedAt(toDateKey(new Date()));
    setPublished(false);
    setUploadError('');
  }

  function loadIntoForm(book: Book) {
    setEditingId(book.id);
    setTitle(book.title);
    setSlug(book.slug);
    setAuthor(book.author);
    setCoverImageUrl(book.cover_image_url || '');
    setRating(book.rating);
    setReview(book.review);
    setFinishedAt(book.finished_at || '');
    setPublished(book.published);
    setStatus('');
    setUploadError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function handleCoverUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError('');
    setUploading(true);
    try {
      setCoverImageUrl(await uploadImage(file));
    } catch (err) {
      setUploadError(
        err instanceof Error ? `업로드 실패: ${err.message}` : '업로드 실패'
      );
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }

  async function handleSave() {
    if (!title.trim() || !author.trim() || !review.trim()) {
      setStatus('제목과 지은이, 독후감은 필수예요.');
      return;
    }

    // 손으로 적은 slug 도 다듬어서 저장한다 (lib/slug.ts 참고).
    const finalSlug = toSlug(slug, title);
    if (!finalSlug) {
      setStatus('주소로 쓸 글자가 없어요. slug를 직접 적어주세요.');
      return;
    }

    setSaving(true);
    setStatus('');

    const payload = {
      slug: finalSlug,
      title: title.trim(),
      author: author.trim(),
      cover_image_url: coverImageUrl.trim() || null,
      rating: isRating(rating) ? rating : null,
      review,
      finished_at: finishedAt || null,
      published,
    };

    let error;
    if (editingId) {
      ({ error } = await supabaseClient
        .from('books')
        .update(payload)
        .eq('id', editingId));
    } else {
      ({ error } = await supabaseClient.from('books').insert(payload));
    }

    setSaving(false);
    if (error) {
      setStatus(`저장 실패: ${error.message}`);
    } else {
      setStatus('저장했어요.');
      resetForm();
      loadBooks();
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('이 독후감을 삭제할까요?')) return;
    await supabaseClient.from('books').delete().eq('id', id);
    if (editingId === id) resetForm();
    loadBooks();
  }

  return (
    <div className="grid gap-10 md:grid-cols-[1fr_320px]">
      <div>
        <h1 className="mb-6 text-xl font-bold">
          {editingId ? '독후감 수정' : '새 독후감'}
        </h1>

        <div className="flex flex-col gap-4">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="책 제목"
            className="rounded-md border border-line px-3 py-2 text-lg font-semibold focus:border-ink-muted focus:outline-none"
          />

          <input
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="지은이"
            className="rounded-md border border-line px-3 py-2 text-sm focus:border-ink-muted focus:outline-none"
          />

          <input
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder={`slug (비워두면 제목에서 자동: ${toSlug('', title) || '제목-기반'})`}
            title={`저장되는 주소: ${toSlug(slug, title) || '(비어 있음)'}`}
            className="rounded-md border border-line px-3 py-2 text-sm text-ink-muted focus:border-ink-muted focus:outline-none"
          />

          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm text-ink-soft">별점</span>
            {RATINGS.map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setRating(rating === value ? null : value)}
                aria-pressed={rating === value}
                className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                  rating === value
                    ? 'border-ink bg-ink text-paper'
                    : 'border-line text-ink-soft hover:border-ink-muted'
                }`}
              >
                {value}
              </button>
            ))}
            <span className="text-sm text-accent">{stars(rating)}</span>
            {rating !== null && (
              <button
                type="button"
                onClick={() => setRating(null)}
                className="text-xs text-ink-muted underline hover:text-ink-soft"
              >
                지우기
              </button>
            )}
          </div>

          <label className="flex flex-wrap items-center gap-3 text-sm text-ink-soft">
            다 읽은 날
            <input
              type="date"
              value={finishedAt}
              onChange={(e) => setFinishedAt(e.target.value)}
              className="rounded-md border border-line px-3 py-2 text-sm focus:border-ink-muted focus:outline-none"
            />
          </label>

          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center gap-3">
              <input
                value={coverImageUrl}
                onChange={(e) => setCoverImageUrl(e.target.value)}
                placeholder="표지 이미지 주소 (선택)"
                className="min-w-0 flex-1 rounded-md border border-line px-3 py-2 text-sm focus:border-ink-muted focus:outline-none"
              />
              <label className="cursor-pointer whitespace-nowrap rounded-md border border-line px-3 py-2 text-sm text-ink-soft hover:border-ink-muted">
                {uploading ? '올리는 중...' : '표지 올리기'}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCoverUpload}
                  className="hidden"
                />
              </label>
            </div>
            {uploadError && (
              <p className="text-xs text-accent">{uploadError}</p>
            )}
            {coverImageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={coverImageUrl}
                alt="표지 미리보기"
                className="h-32 w-24 rounded-md border border-line object-cover"
              />
            )}
          </div>

          <textarea
            value={review}
            onChange={(e) => setReview(e.target.value)}
            placeholder="독후감을 마크다운으로 적어주세요..."
            rows={16}
            className="rounded-md border border-line px-3 py-2 font-mono text-sm leading-relaxed focus:border-ink-muted focus:outline-none"
          />

          <label className="flex items-center gap-2 text-sm text-ink-soft">
            <input
              type="checkbox"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
            />
            발행하기
          </label>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="rounded-md bg-ink px-4 py-2 text-sm text-paper transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {saving ? '저장 중...' : '저장'}
            </button>
            {editingId && (
              <button
                onClick={resetForm}
                className="text-sm text-ink-muted underline hover:text-ink-soft"
              >
                새로 쓰기
              </button>
            )}
            {status && <span className="text-sm text-ink-muted">{status}</span>}
          </div>
        </div>
      </div>

      <aside>
        <h2 className="mb-4 text-sm text-ink-muted">독후감 {books.length}편</h2>

        {loading ? (
          <p className="text-sm text-ink-muted">불러오는 중...</p>
        ) : books.length === 0 ? (
          <p className="text-sm text-ink-muted">아직 없어요.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {books.map((book) => (
              <li
                key={book.id}
                className="border-b border-line pb-3 last:border-b-0"
              >
                <p className="text-sm font-medium">
                  {book.title}
                  {!book.published && (
                    <span className="ml-2 text-xs text-ink-muted">
                      임시저장
                    </span>
                  )}
                </p>
                <p className="mt-1 text-xs text-ink-muted">
                  {book.author}
                  {stars(book.rating) && (
                    <span className="ml-2 text-accent">
                      {stars(book.rating)}
                    </span>
                  )}
                </p>
                <div className="mt-2 flex gap-3 text-xs">
                  <button
                    onClick={() => loadIntoForm(book)}
                    className="text-ink-soft underline hover:text-ink"
                  >
                    수정
                  </button>
                  <button
                    onClick={() => handleDelete(book.id)}
                    className="text-ink-muted underline hover:text-ink-soft"
                  >
                    삭제
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </aside>
    </div>
  );
}
