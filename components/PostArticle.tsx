import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Post, TAG_LABELS } from '@/lib/types';

function formatDate(dateStr: string | null) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
}

/** 글 한 편의 생김새. 공개 페이지와 관리자 미리보기가 이걸 같이 써요. */
export default function PostArticle({
  post,
  backHref = '/',
  backLabel = '← 목록으로',
}: {
  post: Post;
  backHref?: string;
  backLabel?: string;
}) {
  return (
    <article>
      <Link
        href={backHref}
        className="text-sm text-ink-muted transition-colors hover:text-ink-soft"
      >
        {backLabel}
      </Link>

      <header className="mb-10 mt-6">
        <h1 className="text-2xl font-bold leading-snug">{post.title}</h1>
        <div className="mt-4 flex items-center gap-3 text-xs text-ink-muted">
          <span>{formatDate(post.published_at)}</span>
          {post.tags?.map((t) => (
            <span key={t}>#{TAG_LABELS[t]}</span>
          ))}
        </div>
      </header>

      {post.cover_image_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={post.cover_image_url}
          alt={post.title}
          className="mb-10 w-full rounded-lg"
        />
      )}

      <div className="prose-post">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content}</ReactMarkdown>
      </div>
    </article>
  );
}
