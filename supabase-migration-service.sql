create table if not exists public.service_leaves (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('outing', 'overnight', 'leave', 'final')),
  started_on date not null,
  ended_on date,
  note text,
  created_at timestamptz not null default now(),
  constraint service_leaves_dates_in_order
    check (ended_on is null or ended_on >= started_on)
);

create index if not exists service_leaves_started_on_idx
  on public.service_leaves (started_on desc);

alter table public.service_leaves enable row level security;


-- 정책
--
-- 캘린더의 일정과 같은 규칙이다. 누구나 읽고 쓰기는 주인만 한다.
--
-- 읽기를 열어두는 건 이 표가 공개 화면에 그려지기 때문이다. 언제 부대 밖에
-- 있는지가 그대로 드러나므로, 남에게 보이면 곤란한 일정은 적지 않는 편이 낫다.
-- 닫고 싶으면 아래 select 정책의 using (true) 를 using (public.is_owner()) 로
-- 바꾸면 된다. 그러면 로그인한 나만 보인다.

drop policy if exists "service_leaves_select" on public.service_leaves;
create policy "service_leaves_select"
  on public.service_leaves
  for select
  using (true);

drop policy if exists "service_leaves_manage_owner" on public.service_leaves;
create policy "service_leaves_manage_owner"
  on public.service_leaves
  for all
  to authenticated
  using (public.is_owner())
  with check (public.is_owner());
