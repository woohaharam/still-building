import type { Metadata } from 'next';
import Link from 'next/link';
import Container from '@/components/Container';
import DutySheet from '@/components/service/DutySheet';
import DutySummary from '@/components/service/DutySummary';
import { buildDutySheet, dutyTimeLabel, tallyDuties } from '@/lib/duty';
import { getDuties } from '@/lib/duties';
import { siteUrl } from '@/lib/site';
import { DUTY_SLOTS, DUTY_SLOT_LABELS } from '@/lib/types';

export const revalidate = 0;

export const metadata: Metadata = {
  title: '근무 명세서',
  description: '어느 날 어느 타임에 들어갔는지.',
  alternates: { canonical: `${siteUrl}/service/duty` },
  /*
    링크로는 열리지만 검색에는 올리지 않는다.

    나가는 일정은 '언제 부대 밖에 있나'까지지만, 이쪽은 언제 어느 타임에 서
    있었는지가 날짜 단위로 남는다. 보여주고 싶을 때 주소를 건네는 것과, 이름을
    검색하면 나오는 것은 다르다. 사이트맵에도 넣지 않았다 (app/sitemap.ts).
  */
  robots: { index: false, follow: true },
};

export default async function DutyPage() {
  const rows = buildDutySheet(await getDuties());
  const tally = tallyDuties(rows);

  return (
    <Container>
      <div className="flex flex-col gap-10">
        <section>
          <Link
            href="/service"
            className="text-xs text-ink-muted underline-offset-4 hover:text-ink-soft hover:underline"
          >
            ← 복무 기록
          </Link>

          <h1 className="mt-4 text-2xl font-bold leading-snug">근무 명세서</h1>
          <p className="mt-3 text-sm leading-relaxed text-ink-soft">
            어느 날 어느 타임에 들어갔는지 한 줄씩 적어두는 곳이에요.
          </p>
        </section>

        <DutySummary tally={tally} />

        <DutySheet rows={rows} />

        {/*
          여기 쓰는 말은 부대 안에서만 통한다. 나중에 내가 다시 볼 때도,
          이 페이지를 우연히 연 사람에게도 한 번은 풀어써 둬야 읽힌다.
        */}
        <section className="border-t border-line pt-8">
          <h2 className="section-label mb-4">읽는 법</h2>

          <dl className="flex flex-col gap-4 text-sm leading-relaxed">
            <div>
              <dt className="font-medium">타임</dt>
              <dd className="mt-1 text-ink-soft">
                <p>
                  하루를 다섯으로 끊어요. 근무일은 자정이 아니라 오전(08시)에
                  시작해서 다음 날 08시에 끝나요 — 열삼과 삼팔은 시계로는 자정을
                  넘기지만 앞선 근무일에 적혀요.
                </p>

                {/*
                  한 줄로 이어 적었더니 좁은 화면에서 접히지 않았다. 타임 이름과
                  시각을 붙여둬야 해서 각 토막에 whitespace-nowrap 을 걸었는데,
                  토막 사이에 띄어쓰기가 없으면 브라우저가 끊을 자리를 못 찾는다.
                  애초에 다섯 줄짜리 표라 목록으로 두는 편이 읽기도 낫다.
                */}
                <ul className="mt-2 flex flex-col gap-1">
                  {DUTY_SLOTS.map((slot) => (
                    <li key={slot} className="flex gap-3">
                      <span className="w-8 shrink-0">
                        {DUTY_SLOT_LABELS[slot]}
                      </span>
                      <span className="tabular-nums">
                        {dutyTimeLabel(slot)}
                      </span>
                    </li>
                  ))}
                </ul>
              </dd>
            </div>

            <div>
              <dt className="font-medium">조</dt>
              <dd className="mt-1 text-ink-soft">
                직전 근무에서 몇 타임 만에 다시 들어왔는지. 오후 다음 날
                오전이면 4조, 오후 다음 날 열삼이면 7조예요.
              </dd>
            </div>

            <div>
              <dt className="font-medium">
                노딱
                <span
                  className="ml-2 inline-block h-2.5 w-2.5 rounded-sm bg-duty-yellow align-middle"
                  aria-hidden
                />
              </dt>
              <dd className="mt-1 text-ink-soft">
                한 근무일에 두 번 들어간 날. 오전에 서고 그날 삼팔에 또 서는
                경우예요. 근무표에 노란색으로 칠해서 노딱이에요.
              </dd>
            </div>

            <div>
              <dt className="font-medium">명근</dt>
              <dd className="mt-1 text-ink-soft">
                명일근무투입. 먹으면 다음 날은 근무가 없고 그다음 날에 다시
                들어가요.
              </dd>
            </div>
          </dl>
        </section>
      </div>
    </Container>
  );
}
