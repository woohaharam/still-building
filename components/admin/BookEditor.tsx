'use client';

import { useState } from 'react';
import AdminList from './AdminList';
import { useAdminCollection } from '@/lib/use-admin-collection';
import CoverImageField from './CoverImageField';
import { today } from '@/lib/calendar';
import { isRating, stars } from '@/lib/rating';
import { toSlug } from '@/lib/slug';
import { Book, MAX_RATING } from '@/lib/types';

const RATINGS = Array.from({ length: MAX_RATING }, (_, i) => i + 1);

export default function BookEditor() {
  const {
    items: books,
    loading,
    editingId,
    setEditingId,
    saving,
    status,
    setStatus,
    save,
    remove,
  } = useAdminCollection<Book>('books', { column: 'finished_at' });

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [author, setAuthor] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [rating, setRating] = useState<number | null>(null);
  const [review, setReview] = useState('');
  // 기본값은 오늘. 이 화면은 로그인한 뒤에만 그려지니 서버와 날짜가 어긋날 일이 없다.
  const [finishedAt, setFinishedAt] = useState(today);
  const [published, setPublished] = useState(false);

  function resetForm() {
    setEditingId(null);
    setTitle('');
    setSlug('');
    setAuthor('');
    setCoverImageUrl('');
    setRating(null);
    setReview('');
    setFinishedAt(today());
    setPublished(false);
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

    const saved = await save({
      slug: finalSlug,
      title: title.trim(),
      author: author.trim(),
      cover_image_url: coverImageUrl.trim() || null,
      rating: isRating(rating) ? rating : null,
      review,
      finished_at: finishedAt || null,
      published,
    });

    if (saved) resetForm();
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

          <CoverImageField
            value={coverImageUrl}
            onChange={setCoverImageUrl}
            placeholder="표지 이미지 주소 (선택)"
            buttonLabel="표지 올리기"
            previewAlt="표지 미리보기"
            previewClassName="h-32 w-24"
          />

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

      <AdminList
        title={`독후감 ${books.length}편`}
        items={books}
        loading={loading}
        onEdit={loadIntoForm}
        onRemove={(book) =>
          remove(book.id, '이 독후감을 삭제할까요?').then(
            (done) => done && resetForm()
          )
        }
      >
        {(book) => (
          <>
            <p className="text-sm font-medium">
              {book.title}
              {!book.published && (
                <span className="ml-2 text-xs text-ink-muted">임시저장</span>
              )}
            </p>
            <p className="mt-1 text-xs text-ink-muted">
              {book.author}
              {stars(book.rating) && (
                <span className="ml-2 text-accent">{stars(book.rating)}</span>
              )}
            </p>
          </>
        )}
      </AdminList>
    </div>
  );
}
