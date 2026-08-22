import Container from '@/components/Container';
import type { Metadata } from 'next';
import Calendar from '@/components/Calendar';
import { getEvents } from '@/lib/events';
import { getPublishedPosts } from '@/lib/posts';
import { siteUrl } from '@/lib/site';

export const revalidate = 0;

export const metadata: Metadata = {
  title: '달력',
  description: '일정과 글을 쓴 날들을 한 달 단위로 모아 봅니다.',
  alternates: { canonical: `${siteUrl}/calendar` },
};

export default async function CalendarPage() {
  const [posts, events] = await Promise.all([getPublishedPosts(), getEvents()]);

  return (
    <Container>
      <div>
        <section className="mb-10">
          <h1 className="text-2xl font-bold leading-snug">달력</h1>
          <p className="mt-3 text-sm leading-relaxed text-ink-soft">
            앞으로의 일정과, 지금까지 글을 쓴 날들을 한 달 단위로 모아 봤어요.
          </p>
        </section>

        <Calendar posts={posts} events={events} />
      </div>
    </Container>
  );
}
