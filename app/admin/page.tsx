'use client';

import { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { supabaseClient } from '@/lib/supabase';
import { uploadImage } from '@/lib/storage';
import { Post, PostTag, TAG_LABELS } from '@/lib/types';
import EventEditor from '@/components/EventEditor';

const TAG_OPTIONS: PostTag[] = ['tech', 'life', 'retrospective'];
const SESSION_KEY = 'sb_admin_unlocked';

function slugify(title: string) {
  return title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9가-힣\s-]/g, '')
    .replace(/\s+/g, '-')
    .slice(0, 60);
}

type AdminTab = 'posts' | 'events';

export default function AdminPage() {
  const [unlocked, setUnlocked] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState('');
  const [tab, setTab] = useState<AdminTab>('posts');

  useEffect(() => {
    if (sessionStorage.getItem(SESSION_KEY) === '1') {
      setUnlocked(true);
    }
  }, []);

  function handleUnlock(e: React.FormEvent) {
    e.preventDefault();
    if (passcode === process.env.NEXT_PUBLIC_ADMIN_PASSCODE) {
      sessionStorage.setItem(SESSION_KEY, '1');
      setUnlocked(true);
      setError('');
    } else {
      setError('비밀번호가 맞지 않아요.');
    }
  }

  if (!unlocked) {
    return (
      <div className="max-w-sm mx-auto py-20">
        <h1 className="text-xl font-bold mb-6">관리자 인증</h1>
        <form onSubmit={handleUnlock} className="flex flex-col gap-3">
          <input
            type="password"
            value={passcode}
            onChange={(e) => setPasscode(e.target.value)}
            placeholder="비밀번호"
            className="border border-line rounded-md px-3 py-2 text-sm focus:outline-none focus:border-ink-muted"
            autoFocus
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            className="bg-ink text-paper rounded-md py-2 text-sm font-medium"
          >
            입장하기
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center gap-2">
        {([
          ['posts', '글'],
          ['events', '일정'],
        ] as [AdminTab, string][]).map(([value, label]) => (
          <button
            key={value}
            onClick={() => setTab(value)}
            className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
              tab === value
                ? 'border-ink bg-ink text-paper'
                : 'border-line text-ink-soft hover:border-ink-muted'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'posts' ? <Editor /> : <EventEditor />}
    </div>
  );
}

function Editor() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState('');

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<PostTag[]>([]);
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [published, setPublished] = useState(false);
  // 이미 발행된 글의 발행일 — 수정할 때 오늘 날짜로 덮어쓰지 않으려고 들고 있어요.
  const [publishedAt, setPublishedAt] = useState<string | null>(null);

  const [coverUploading, setCoverUploading] = useState(false);
  const [contentUploading, setContentUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const coverFileInputRef = useRef<HTMLInputElement>(null);
  const contentFileInputRef = useRef<HTMLInputElement>(null);

  async function loadPosts() {
    setLoading(true);
    const { data, error } = await supabaseClient
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data) setPosts(data as Post[]);
    setLoading(false);
  }

  useEffect(() => {
    loadPosts();
  }, []);

  function resetForm() {
    setEditingId(null);
    setTitle('');
    setSlug('');
    setExcerpt('');
    setContent('');
    setTags([]);
    setCoverImageUrl('');
    setPublished(false);
    setPublishedAt(null);
  }

  function loadIntoForm(post: Post) {
    setEditingId(post.id);
    setTitle(post.title);
    setSlug(post.slug);
    setExcerpt(post.excerpt || '');
    setContent(post.content || '');
    setTags(post.tags || []);
    setCoverImageUrl(post.cover_image_url || '');
    setPublished(post.published);
    setPublishedAt(post.published_at);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function handleCoverUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError('');
    setCoverUploading(true);
    try {
      const url = await uploadImage(file);
      setCoverImageUrl(url);
    } catch (err) {
      setUploadError(
        err instanceof Error ? `업로드 실패: ${err.message}` : '업로드 실패'
      );
    } finally {
      setCoverUploading(false);
      if (coverFileInputRef.current) coverFileInputRef.current.value = '';
    }
  }

  async function handleContentImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError('');
    setContentUploading(true);
    try {
      const url = await uploadImage(file);
      const markdown = `![${file.name}](${url})`;
      const textarea = contentRef.current;
      if (textarea) {
        const start = textarea.selectionStart ?? content.length;
        const end = textarea.selectionEnd ?? content.length;
        const next = content.slice(0, start) + markdown + content.slice(end);
        setContent(next);
        requestAnimationFrame(() => {
          textarea.focus();
          const cursor = start + markdown.length;
          textarea.setSelectionRange(cursor, cursor);
        });
      } else {
        setContent((prev) => `${prev}\n${markdown}\n`);
      }
    } catch (err) {
      setUploadError(
        err instanceof Error ? `업로드 실패: ${err.message}` : '업로드 실패'
      );
    } finally {
      setContentUploading(false);
      if (contentFileInputRef.current) contentFileInputRef.current.value = '';
    }
  }

  function toggleTag(tag: PostTag) {
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }

  async function handleSave() {
    if (!title.trim() || !content.trim()) {
      setStatus('제목과 본문은 필수예요.');
      return;
    }
    setSaving(true);
    setStatus('');

    const payload = {
      title,
      slug: slug || slugify(title),
      excerpt,
      content,
      tags,
      cover_image_url: coverImageUrl || null,
      published,
      // 발행일은 처음 발행할 때 한 번만 찍고, 이후 수정에는 그대로 둬요.
      published_at: publishedAt || (published ? new Date().toISOString() : null),
    };

    let error;
    if (editingId) {
      ({ error } = await supabaseClient
        .from('posts')
        .update(payload)
        .eq('id', editingId));
    } else {
      ({ error } = await supabaseClient.from('posts').insert(payload));
    }

    setSaving(false);
    if (error) {
      setStatus(`저장 실패: ${error.message}`);
    } else {
      setStatus('저장했어요.');
      resetForm();
      loadPosts();
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('정말 삭제할까요?')) return;
    await supabaseClient.from('posts').delete().eq('id', id);
    loadPosts();
  }

  return (
    <div className="grid md:grid-cols-[1fr_320px] gap-10">
      <div>
        <h1 className="text-xl font-bold mb-6">
          {editingId ? '글 수정' : '새 글 작성'}
        </h1>

        <div className="flex flex-col gap-4">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="제목"
            className="border border-line rounded-md px-3 py-2 text-lg font-semibold focus:outline-none focus:border-ink-muted"
          />
          <input
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder={`slug (비워두면 자동 생성: ${slugify(title) || '제목-기반'})`}
            className="border border-line rounded-md px-3 py-2 text-sm text-ink-muted focus:outline-none focus:border-ink-muted"
          />
          <textarea
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            placeholder="요약 (목록에 보여질 짧은 설명)"
            rows={2}
            className="border border-line rounded-md px-3 py-2 text-sm focus:outline-none focus:border-ink-muted resize-none"
          />
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <input
                value={coverImageUrl}
                onChange={(e) => setCoverImageUrl(e.target.value)}
                placeholder="커버 이미지 URL (선택)"
                className="flex-1 border border-line rounded-md px-3 py-2 text-sm focus:outline-none focus:border-ink-muted"
              />
              <button
                type="button"
                onClick={() => coverFileInputRef.current?.click()}
                disabled={coverUploading}
                className="shrink-0 border border-line rounded-md px-3 py-2 text-sm text-ink-soft hover:border-ink-muted disabled:opacity-50"
              >
                {coverUploading ? '업로드 중...' : '사진 업로드'}
              </button>
              <input
                ref={coverFileInputRef}
                type="file"
                accept="image/*"
                onChange={handleCoverUpload}
                className="hidden"
              />
            </div>
            {coverImageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={coverImageUrl}
                alt="커버 미리보기"
                className="h-32 w-full object-cover rounded-md border border-line"
              />
            )}
          </div>

          {uploadError && <p className="text-sm text-red-600">{uploadError}</p>}

          <div className="flex items-center justify-between">
            <span className="text-sm text-ink-soft">본문 (마크다운)</span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => contentFileInputRef.current?.click()}
                disabled={contentUploading || showPreview}
                className="text-xs text-ink-muted hover:text-ink-soft underline disabled:opacity-50 disabled:no-underline"
              >
                {contentUploading ? '업로드 중...' : '본문에 사진 삽입'}
              </button>
              <input
                ref={contentFileInputRef}
                type="file"
                accept="image/*"
                onChange={handleContentImageUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => setShowPreview((v) => !v)}
                className="text-xs text-ink-muted hover:text-ink-soft underline"
              >
                {showPreview ? '편집으로 돌아가기' : '미리보기'}
              </button>
            </div>
          </div>

          {showPreview ? (
            <div className="prose-post border border-line rounded-md px-4 py-3 min-h-[300px]">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {content || '_내용이 없어요._'}
              </ReactMarkdown>
            </div>
          ) : (
            <textarea
              ref={contentRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="여기에 마크다운으로 작성하세요..."
              rows={16}
              className="border border-line rounded-md px-3 py-2 text-sm font-mono focus:outline-none focus:border-ink-muted resize-y"
            />
          )}

          <div className="flex items-center gap-2 flex-wrap">
            {TAG_OPTIONS.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                  tags.includes(tag)
                    ? 'bg-ink text-paper border-ink'
                    : 'border-line text-ink-soft'
                }`}
              >
                #{TAG_LABELS[tag]}
              </button>
            ))}
          </div>

          <label className="flex items-center gap-2 text-sm text-ink-soft">
            <input
              type="checkbox"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
            />
            발행하기 (체크 해제 시 임시저장)
          </label>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-ink text-paper rounded-md px-4 py-2 text-sm font-medium disabled:opacity-50"
            >
              {saving ? '저장 중...' : '저장'}
            </button>
            {editingId && (
              <button
                onClick={resetForm}
                className="text-sm text-ink-muted underline"
              >
                새 글로 전환
              </button>
            )}
            {status && <span className="text-sm text-ink-muted">{status}</span>}
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-sm font-semibold text-ink-soft mb-4">
          전체 글 ({posts.length})
        </h2>
        {loading ? (
          <p className="text-sm text-ink-muted">불러오는 중...</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {posts.map((post) => (
              <li
                key={post.id}
                className="border border-line rounded-md p-3 text-sm"
              >
                <div className="flex items-center justify-between gap-2">
                  <button
                    onClick={() => loadIntoForm(post)}
                    className="text-left font-medium hover:text-accent truncate"
                  >
                    {post.title || '(제목 없음)'}
                  </button>
                  {!post.published && (
                    <span className="text-xs text-ink-muted shrink-0">임시</span>
                  )}
                </div>
                <div className="mt-1 flex items-center justify-between">
                  <span className="text-xs text-ink-muted">
                    {new Date(post.created_at).toLocaleDateString('ko-KR')}
                  </span>
                  <button
                    onClick={() => handleDelete(post.id)}
                    className="text-xs text-red-500 hover:underline"
                  >
                    삭제
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
