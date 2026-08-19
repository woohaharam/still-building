import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import PostArticle from '@/components/PostArticle';
import { getPostBySlug } from '@/lib/posts';
import { postUrl } from '@/lib/site';

export const revalidate = 0;

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

  return <PostArticle post={post!} />;
}
