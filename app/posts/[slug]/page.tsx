import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Container from '@/components/Container';
import JsonLd from '@/components/JsonLd';
import PostArticle from '@/components/PostArticle';
import PostNav from '@/components/PostNav';
import { getAdjacentPosts, getPostBySlug } from '@/lib/posts';
import { postUrl, siteAuthor, siteName, siteUrl } from '@/lib/site';
import { metaDescription } from '@/lib/text';

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

  const description = metaDescription(post);

  return {
    title: post.title,
    description,
    alternates: { canonical: postUrl(post.slug) },
    openGraph: {
      title: post.title,
      description,
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

  const url = postUrl(post!.slug);
  const published = post!.published_at || post!.created_at;
  const { older, newer } = await getAdjacentPosts(post!.slug);

  return (
    <Container>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'BlogPosting',
          headline: post!.title,
          description: metaDescription(post!),
          url,
          mainEntityOfPage: { '@type': 'WebPage', '@id': url },
          datePublished: published,
          dateModified: published,
          inLanguage: 'ko-KR',
          image: post!.cover_image_url || `${url}/opengraph-image`,
          author: { '@type': 'Person', name: siteAuthor },
          publisher: { '@type': 'Organization', name: siteName, url: siteUrl },
          keywords: post!.tags?.join(', ') || undefined,
        }}
      />
      <PostArticle post={post!} />
      <PostNav older={older} newer={newer} />
    </Container>
  );
}
