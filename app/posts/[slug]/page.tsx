import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { getPostBySlug } from '@/lib/posts';
import { postUrl } from '@/lib/site';
import { TAG_LABELS } from '@/lib/types';

export const revalidate = 0;

function formatDate(dateStr: string | null) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const post = await getPostBySlug(decodeURIComponent(params.slug));

  if (!post) {
    return { title: '글을 찾을 수 없어요' };
  }

  return {
    title: post.title,
    description: post.excerpt || undefined,
    openGraph: {
      title: post.title,
      description: post.excerpt || undefined,
      url: postUrl(post.slug),
      type: 'article',
      publishedTime: post.published_at || undefined,
    },
  };
}

export default async function PostPage({
  params,
}: {
  params: { slug: string };
}) {
  const post = await getPostBySlug(decodeURIComponent(params.slug));

  if (!post) {
    notFound();
  }

  return (
    <article>
      <Link
        href="/"
        className="text-sm text-ink-muted hover:text-ink-soft transition-colors"
      >
        ← 목록으로
      </Link>

      <header className="mt-6 mb-10">
        <h1 className="text-2xl font-bold leading-snug">{post!.title}</h1>
        <div className="mt-4 flex items-center gap-3 text-xs text-ink-muted">
          <span>{formatDate(post!.published_at)}</span>
          {post!.tags?.map((t) => (
            <span key={t}>#{TAG_LABELS[t]}</span>
          ))}
        </div>
      </header>

      {post!.cover_image_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={post!.cover_image_url}
          alt={post!.title}
          className="w-full rounded-lg mb-10"
        />
      )}

      <div className="prose-post">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {post!.content}
        </ReactMarkdown>
      </div>
    </article>
  );
}
