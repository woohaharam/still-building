-- 메인 화면의 남은 날
--
-- 중요한 일정을 메인에 D-14 처럼 띄우기 위한 두 가지다.
--
-- pinned — 메인에 띄울지. 종류로 가르지 않는 이유는, 무엇이 중요한지가
-- 종류에서 나오지 않아서다. 어떤 마감은 그냥 적어두는 것이고 어떤 약속은 몇
-- 주 전부터 세게 된다. 중요한지는 적는 사람만 안다.
--
-- exam — 시험을 마감과 따로 뒀다. 제출은 그날까지 내면 되지만 시험은 그 시각에
-- 그 자리에 있어야 한다. 남은 날을 세는 무게가 다르다.
--
-- 이미 쌓인 행은 pinned 가 false 로 채워져서 지금과 똑같이 동작한다.

alter table public.events
  add column if not exists pinned boolean not null default false;

-- 메인은 '앞으로 올 것 중 띄우기로 한 것' 만 읽는다. 대부분의 행은 pinned 가
-- false 라서, 참인 행만 담는 부분 인덱스면 충분하다.
create index if not exists events_pinned_idx
  on public.events (start_date)
  where pinned;

alter table public.events
  drop constraint if exists events_kind_check;

alter table public.events
  add constraint events_kind_check
  check (kind in ('plan', 'deadline', 'exam', 'note'));
