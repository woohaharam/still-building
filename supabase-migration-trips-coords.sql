-- 여행에 좌표 붙이기
--
-- 지도에 핀을 찍으려면 어디인지가 숫자로 있어야 한다. 비워두면 나라 중심점에
-- 찍히므로(lib/travel.ts) 해외 여행은 굳이 안 적어도 된다. 국내 여행은 나라
-- 안 어디였는지가 중요하니 적어두는 편이 낫다.
--
-- 관리자 화면에서 지도를 눌러 고를 수 있다. 손으로 받아적을 일은 없다.
--
-- 이미 쌓인 행은 두 칸이 null 이라 나라 중심점을 쓴다.

alter table public.trips
  add column if not exists lng double precision,
  add column if not exists lat double precision;

-- 지구 밖 좌표를 막는다. 둘 중 하나만 적히는 것도 막는다 — 반쪽 좌표로는
-- 핀을 찍을 수 없는데, 화면에서는 '적어뒀다'고 보인다.
alter table public.trips
  drop constraint if exists trips_coord_valid;

alter table public.trips
  add constraint trips_coord_valid check (
    (lng is null and lat is null)
    or (
      lng between -180 and 180
      and lat between -90 and 90
    )
  );
