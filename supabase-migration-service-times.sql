-- 나가는 일정에 출영·복귀 시각 붙이기
--
-- 처음에는 날짜만 있었다. 그래서 복귀하는 날 자정까지 '외출 중'이 남았고,
-- 나가는 날은 새벽부터 이미 나가 있는 것으로 보였다.
--
-- 시각 대부분은 규정이라 일정마다 다르지 않다. 그런 건 코드의 LEAVE_SCHEDULE
-- 에 적혀 있어서 여기 넣을 필요가 없다. 이 두 칸은 특별외출처럼 받을 때마다
-- 시각이 달라지는 일정을 위한 자리다. 비워두면 규정 시각을 쓴다.
--
-- 이미 쌓인 행은 두 칸이 null 로 채워지므로 그대로 규정 시각을 따른다.

alter table public.service_leaves
  add column if not exists left_at time,
  add column if not exists returned_at time;

-- 같은 날 나갔다 들어오는 일정이 거꾸로 적히는 걸 막는다.
-- 여러 날짜에 걸친 일정은 나가는 날과 들어오는 날이 다르므로 검사하지 않는다.
alter table public.service_leaves
  drop constraint if exists service_leaves_times_in_order;

alter table public.service_leaves
  add constraint service_leaves_times_in_order check (
    ended_on is not null and ended_on <> started_on
    or left_at is null
    or returned_at is null
    or returned_at > left_at
  );
