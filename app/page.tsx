import { getPublishedPosts } from '@/lib/posts';
import PostList from '@/components/PostList';

export const revalidate = 0;

export default async function HomePage() {
  const posts = await getPublishedPosts();

  return (
    <div>
      <section className="mb-14">
        <h1 className="text-2xl font-bold leading-snug">
          코드를 짜고, 그 사이사이의 하루를 기록합니다.
        </h1>
        <p className="mt-3 text-ink-soft text-sm leading-relaxed">
          개발하면서 배운 것들과, 그 사이의 일상과 생각을 남겨두는 공간이에요.
        </p>
      </section>

      <PostList posts={posts} />
    </div>
  );
}
