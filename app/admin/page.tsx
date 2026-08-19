'use client';

import { useEffect, useRef, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { supabaseClient } from '@/lib/supabase';
import { uploadImage } from '@/lib/storage';
import { toDateKey } from '@/lib/calendar';
import { Post, PostTag, TAG_LABELS } from '@/lib/types';
import EventEditor from '@/components/EventEditor';

const TAG_OPTIONS: PostTag[] = ['tech', 'life', 'retrospective'];

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
  const [session, setSession] = useState<Session | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [tab, setTab] = useState<AdminTab>('posts');

  useEffect(() => {
    supabaseClient.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setCheckingSession(false);
    });

    const { data } = supabaseClient.auth.onAuthStateChange((_event, next) => {
      setSession(next);
    });

    return () => data.subscription.unsubscribe();
  }, []);

  if (checkingSession) {
    return <p className="py-20 text-center text-sm text-ink-muted">확인 중...</p>;
  }

  if (!session) {
    return <SignIn />;
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
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

        <div className="flex items-center gap-3 text-xs text-ink-muted">
          <span className="truncate">{session.user.email}</span>
          <button
            onClick={() => supabaseClient.auth.signOut()}
            className="underline hover:text-ink-soft"
          >
            로그아웃
          </button>
        </div>
      </div>

      {tab === 'posts' ? <Editor /> : <EventEditor />}
    </div>
  );
}

function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    const { error: signInError } = await supabaseClient.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    setSubmitting(false);
    if (signInError) {
      setError(
        signInError.message === 'Invalid login credentials'
          ? '이메일이나 비밀번호가 맞지 않아요.'
          : signInError.message
      );
    }
    // 성공하면 onAuthStateChange가 알아서 화면을 바꿔줘요.
  }

  return (
    <div className="mx-auto max-w-sm py-20">
      <h1 className="mb-2 text-xl font-bold">관리자 로그인</h1>
      <p className="mb-6 text-sm text-ink-muted">
        Supabase에 등록한 계정으로 로그인해주세요.
      </p>
      <form onSubmit={handleSignIn} className="flex flex-col gap-3">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="이메일"
          autoComplete="username"
          className="rounded-md border border-line px-3 py-2 text-sm focus:border-ink-muted focus:outline-none"
          autoFocus
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="비밀번호"
          autoComplete="current-password"
          className="rounded-md border border-line px-3 py-2 text-sm focus:border-ink-muted focus:outline-none"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-ink py-2 text-sm font-medium text-paper disabled:opacity-50"
        >
          {submitting ? '로그인 중...' : '로그인'}
        </button>
      </form>
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
  // 발행일을 직접 고를 때 쓰는 'YYYY-MM-DD'
  const [publishedDate, setPublishedDate] = useState('');

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
    setPublishedDate('');
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
    setPublishedDate(
      post.published_at ? toDateKey(new Date(post.published_at)) : ''
    );
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

  /**
   * 발행일 결정 규칙
   * - 날짜를 손대지 않았으면 원래 발행일 그대로 (수정할 때마다 오늘로 밀리지 않게)
   * - 날짜를 바꿨으면 그 날 정오로 — 시간대가 달라져도 날짜가 하루 밀리지 않아요
   * - 처음 발행하는데 날짜를 안 골랐으면 지금
   */
  function resolvePublishedAt(): string | null {
    if (!published) return publishedAt;

    if (publishedDate) {
      const current = publishedAt ? new Date(publishedAt) : null;
      if (current && toDateKey(current) === publishedDate) return publishedAt;

      const [year, month, day] = publishedDate.split('-').map(Number);
      return new Date(year, month - 1, day, 12, 0, 0).toISOString();
    }

    return publishedAt || new Date().toISOString();
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
      published_at: resolvePublishedAt(),
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

          <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
            <label className="flex items-center gap-2 text-sm text-ink-soft">
              <input
                type="checkbox"
                checked={published}
                onChange={(e) => {
                  setPublished(e.target.checked);
                  // 처음 체크할 때 날짜 칸을 오늘로 채워둬요.
                  if (e.target.checked && !publishedDate) {
                    setPublishedDate(toDateKey(new Date()));
                  }
                }}
              />
              발행하기 (체크 해제 시 임시저장)
            </label>

            {published && (
              <label className="flex items-center gap-2 text-sm text-ink-soft">
                발행일
                <input
                  type="date"
                  value={publishedDate}
                  onChange={(e) => setPublishedDate(e.target.value)}
                  className="rounded-md border border-line px-2 py-1 text-sm text-ink focus:border-ink-muted focus:outline-none"
                />
              </label>
            )}
          </div>

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
                <div className="mt-1 flex items-center justify-between gap-2">
                  <span className="text-xs text-ink-muted">
                    {new Date(post.created_at).toLocaleDateString('ko-KR')}
                  </span>
                  <span className="flex shrink-0 items-center gap-3">
                    <a
                      href={`/admin/preview/${encodeURIComponent(post.slug)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-ink-muted hover:underline"
                    >
                      미리보기
                    </a>
                    <button
                      onClick={() => handleDelete(post.id)}
                      className="text-xs text-red-500 hover:underline"
                    >
                      삭제
                    </button>
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
