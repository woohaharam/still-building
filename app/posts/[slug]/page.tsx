import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import AdFit from '@/components/AdFit';
import Comments from '@/components/Comments';
import Container from '@/components/Container';
import JsonLd from '@/components/JsonLd';
import PostArticle from '@/components/PostArticle';
import PostNav from '@/components/PostNav';
import { getAdjacentPosts, getPostBySlug } from '@/lib/posts';
import { postUrl, siteAuthor, siteUrl } from '@/lib/site';
import { metaDescription } from '@/lib/text';

export const revalidate = 0;

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const params = await props.params;
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

export default async function PostPage(props: {
  params: Promise<{ slug: string }>;
}) {
  const params = await props.params;
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
          publisher: { '@type': 'Person', name: siteAuthor, url: siteUrl },
          keywords: post!.tags?.join(', ') || undefined,
        }}
      />
      <PostArticle post={post!} shareUrl={url} />
      {/* 글을 다 읽은 자리에만 둔다. 이력서·프로젝트 쪽에는 붙이지 않는다. */}
      <AdFit />
      <PostNav older={older} newer={newer} />
      <Comments />
    </Container>
  );
}
