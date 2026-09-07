import type { Metadata } from 'next';
import Link from 'next/link';
import Container from '@/components/Container';
import TravelMap from '@/components/travel/TravelMap';
import { countryName, flagEmoji } from '@/lib/country';
import { formatDate } from '@/lib/date';
import { siteUrl } from '@/lib/site';
import {
  KOREA_FRAME,
  KOREA_PATH,
  WORLD_FRAME,
  WORLD_PATH,
} from '@/lib/map-data';
import { splitByRegion, stayLabel, uniqueCountries } from '@/lib/travel';
import { getPublishedTrips } from '@/lib/trips';
import { Trip } from '@/lib/types';

export const revalidate = 0;

export const metadata: Metadata = {
  title: '여행',
  description: '다녀온 곳과 거기서 남은 기록.',
  alternates: { canonical: `${siteUrl}/travel` },
};

function TripRow({ trip }: { trip: Trip }) {
  return (
    <li className="border-b border-line py-6 first:pt-0">
      <Link
        href={`/travel/${encodeURIComponent(trip.slug)}`}
        className="group flex items-start gap-4"
      >
        <span
          className="shrink-0 text-3xl leading-none"
          aria-label={countryName(trip.country_code)}
        >
          {flagEmoji(trip.country_code)}
        </span>

        <span className="min-w-0 flex-1">
          <span className="block text-lg font-semibold transition-colors group-hover:text-accent">
            {trip.place}
          </span>
          <span className="mt-1 block text-sm text-ink-soft">
            {countryName(trip.country_code)}
          </span>
          <span className="mt-3 flex flex-wrap items-center gap-3 text-xs text-ink-muted">
            <span>{formatDate(trip.started_on)}</span>
            <span>{stayLabel(trip.started_on, trip.ended_on)}</span>
          </span>
        </span>

        {trip.cover_image_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={trip.cover_image_url}
            alt=""
            loading="lazy"
            className="h-20 w-20 shrink-0 rounded-md border border-line object-cover sm:h-24 sm:w-24"
          />
        )}
      </Link>
    </li>
  );
}

export default async function TravelPage() {
  const trips = await getPublishedTrips();
  const countries = uniqueCountries(trips);
  const { domestic, abroad } = splitByRegion(trips);

  return (
    <Container>
      <div className="flex flex-col gap-8">
        <section>
          <h1 className="text-2xl font-bold leading-snug">여행</h1>
          <p className="mt-3 text-sm leading-relaxed text-ink-soft">
            다녀온 곳과, 거기서 남은 기록.
          </p>
        </section>

        {trips.length === 0 ? (
          <p className="py-12 text-center text-sm text-ink-muted">
            아직 적어둔 여행이 없어요.
          </p>
        ) : (
          <>
            <section className="rounded-md border border-line px-5 py-5">
              <p className="flex flex-wrap gap-2 text-3xl leading-none">
                {countries.map((code) => (
                  <span key={code} title={countryName(code)}>
                    {flagEmoji(code)}
                  </span>
                ))}
              </p>
              <p className="mt-4 text-xs text-ink-muted">
                {countries.length}개 나라 · 여행 {trips.length}번
              </p>
            </section>

            {/*
              세계 지도에는 국내 여행도 같이 찍는다. 어디를 다녔는지 한눈에
              보는 자리라 국내와 해외를 가를 이유가 없다. 나라 안 어디였는지는
              아래 한국 지도가 맡는다.
            */}
            <TravelMap
              frame={WORLD_FRAME}
              path={WORLD_PATH}
              trips={trips}
              label="세계 지도"
            />

            {domestic.length > 0 && (
              <TravelMap
                frame={KOREA_FRAME}
                path={KOREA_PATH}
                trips={domestic}
                label="한국 지도"
                className="mx-auto w-full max-w-[19rem]"
              />
            )}

            {abroad.length > 0 && (
              <section>
                <h2 className="section-label mb-4">해외</h2>
                <ul className="flex flex-col">
                  {abroad.map((trip) => (
                    <TripRow key={trip.id} trip={trip} />
                  ))}
                </ul>
              </section>
            )}

            {domestic.length > 0 && (
              <section>
                <h2 className="section-label mb-4">국내</h2>
                <ul className="flex flex-col">
                  {domestic.map((trip) => (
                    <TripRow key={trip.id} trip={trip} />
                  ))}
                </ul>
              </section>
            )}
          </>
        )}
      </div>
    </Container>
  );
}
