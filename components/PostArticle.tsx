import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import rehypeSlug from 'rehype-slug';
import remarkGfm from 'remark-gfm';
import CodeBlock from './CodeBlock';
import TableOfContents from './TableOfContents';
import { extractHeadings } from '@/lib/toc';
import { readingMinutes } from '@/lib/reading';
import { Post, TAG_LABELS } from '@/lib/types';

function formatDate(dateStr: string | null) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
}

/** 글 한 편의 생김새. 공개 페이지와 관리자 미리보기가 이걸 같이 써요. */
export default function PostArticle({
  post,
  backHref = '/blog',
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
        <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-ink-muted">
          <span>{formatDate(post.published_at)}</span>
          <span>읽는 데 {readingMinutes(post.content)}분</span>
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

      <TableOfContents headings={extractHeadings(post.content)} />

      <div className="prose-post">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[
            // 제목에 id를 붙여야 목차 링크가 걸려요.
            rehypeSlug,
            // 모르는 언어를 적어도 그냥 강조 없이 넘어가게 해요.
            [rehypeHighlight, { ignoreMissing: true }],
          ]}
          components={{ pre: CodeBlock }}
        >
          {post.content}
        </ReactMarkdown>
      </div>
    </article>
  );
}
