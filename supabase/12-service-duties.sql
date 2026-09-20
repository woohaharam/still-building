-- 근무 명세서
--
-- 어느 날 어느 타임에 들어갔는지를 한 줄씩 쌓는 표다. 나가는 일정
-- (service_leaves)과 섞지 않는다. 하나는 부대 밖으로 나가는 날이고 다른
-- 하나는 부대 안에서 서는 근무라, 같은 표에 넣으면 둘 다 읽기 어려워진다.
--
-- slot 은 크루제의 다섯 타임이다. am 오전 · pm 오후 · evening 석간 ·
-- late 열삼 · dawn 삼팔. 시각은 코드에 있다 (lib/duty.ts 의 DUTY_HOURS).
-- 여기 넣지 않는 건 타임마다 정해진 값이라 행마다 달라질 일이 없어서다.
--
-- served_on 은 시계가 가리키는 날짜가 아니라 근무표에 적히는 날짜다. 근무일은
-- 오전(08시)에 시작해 다음 날 08시에 끝나므로, 열삼과 삼팔은 자정을 넘겨 뛰면서도
-- 앞선 근무일에 적힌다. 그래서 한 근무일에 오전과 삼팔이 같이 오는 날이 생기고,
-- 그게 노딱이다. 노딱은 따로 적지 않는다 — 같은 날에 두 줄이 있으면 그게 노딱이라
-- 손으로 한 번 더 적게 하면 둘이 어긋날 자리만 생긴다 (lib/duty.ts 가 세어준다).

create table if not exists public.service_duties (
  id uuid primary key default gen_random_uuid(),
  served_on date not null,
  slot text not null check (
    slot in ('am', 'pm', 'evening', 'late', 'dawn')
  ),
  -- 명근(명일근무투입). 먹으면 다음 날은 근무가 없고 그다음 날에 다시 들어간다.
  day_off_after boolean not null default false,
  note text,
  created_at timestamptz not null default now(),
  -- 같은 날 같은 타임을 두 번 설 수는 없다. 두 번 적히는 건 손이 미끄러진 것이고,
  -- 그대로 두면 조가 0 으로 계산된다.
  constraint service_duties_one_slot_a_day unique (served_on, slot)
);

create index if not exists service_duties_served_on_idx
  on public.service_duties (served_on desc);

alter table public.service_duties enable row level security;


-- 정책
--
-- 나가는 일정(service_leaves)과 같은 규칙이다. 누구나 읽고 쓰기는 주인만 한다.
--
-- 다만 이 표는 그것보다 한 발 더 나간다. 언제 부대 밖에 있었는지가 아니라,
-- 언제 어느 타임에 위병소에 서 있었는지가 날짜 단위로 남는다. 공개할 생각이
-- 없으면 아래 select 정책의 using (true) 를 using (public.is_owner()) 로 바꾸면
-- 로그인한 나만 보인다. 그때는 /service/duty 도 빈 명세서가 되므로, 링크는
-- 관리자 화면에서만 열게 두는 편이 낫다.

drop policy if exists "service_duties_select" on public.service_duties;
create policy "service_duties_select"
  on public.service_duties
  for select
  using (true);

drop policy if exists "service_duties_manage_owner" on public.service_duties;
create policy "service_duties_manage_owner"
  on public.service_duties
  for all
  to authenticated
  using (public.is_owner())
  with check (public.is_owner());
