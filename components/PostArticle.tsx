import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import rehypeSlug from 'rehype-slug';
import remarkGfm from 'remark-gfm';
import ReadingProgress from './ReadingProgress';
import ShareLink from './ShareLink';
import ViewCounter from './ViewCounter';
import TableOfContents from './TableOfContents';
import { markdownComponents } from '@/lib/markdown';
import { extractHeadings } from '@/lib/toc';
import { readingMinutes } from '@/lib/reading';
import { formatCount } from '@/lib/count';
import { formatDate } from '@/lib/date';
import { Post, TAG_LABELS } from '@/lib/types';

/** 글 한 편의 생김새. 공개 페이지와 관리자 미리보기가 이걸 같이 쓴다. */
export default function PostArticle({
  post,
  backHref = '/blog',
  backLabel = '← 목록으로',
  shareUrl,
}: {
  post: Post;
  backHref?: string;
  backLabel?: string;
  /** 공개된 글에서만 넘긴다. 미리보기 화면에는 공유 버튼이 뜨지 않는다. */
  shareUrl?: string;
}) {
  return (
    <article>
      {shareUrl && <ReadingProgress />}
      {shareUrl && <ViewCounter slug={post.slug} />}

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
          {shareUrl && <span>조회 {formatCount(post.view_count ?? 0)}</span>}
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
            // 제목에 id를 붙여야 목차 링크가 걸린다.
            rehypeSlug,
            // 모르는 언어를 적어도 그냥 강조 없이 넘어가게 한다.
            [rehypeHighlight, { ignoreMissing: true }],
          ]}
          components={markdownComponents}
        >
          {post.content}
        </ReactMarkdown>
      </div>

      {shareUrl && (
        <ShareLink
          url={shareUrl}
          title={post.title}
          slug={post.slug}
          shareCount={post.share_count ?? 0}
        />
      )}
    </article>
  );
}
