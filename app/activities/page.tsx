import type { Metadata } from 'next';
import Container from '@/components/Container';
import WorkNav from '@/components/WorkNav';
import ActivityList from '@/components/project/ActivityList';
import { getActivities } from '@/lib/activities';
import { siteUrl } from '@/lib/site';

export const revalidate = 0;

export const metadata: Metadata = {
  title: '활동',
  description: '지원한 공모전과 대외활동. 떨어진 것도 같이 적어둡니다.',
  alternates: { canonical: `${siteUrl}/activities` },
};

export default async function ActivitiesPage() {
  const activities = await getActivities();

  return (
    <Container wide>
      <div className="flex flex-col gap-16 pb-6">
        <section className="flex flex-col gap-6">
          <div>
            <h1 className="mt-4 text-3xl font-bold tracking-tight">활동</h1>
            <p className="mt-5 leading-relaxed text-ink-soft">
              지원한 공모전과 대외활동입니다. 붙은 것만 적으면 몇 번
              시도했는지가 사라져서, 떨어진 것도 같이 적어둡니다.
            </p>
          </div>

          <WorkNav
            active="activities"
            counts={{ activities: activities.length }}
          />
        </section>

        {activities.length === 0 ? (
          <p className="py-12 text-center text-sm text-ink-muted">
            아직 적어둔 활동이 없어요.
          </p>
        ) : (
          <ActivityList activities={activities} />
        )}
      </div>
    </Container>
  );
}
