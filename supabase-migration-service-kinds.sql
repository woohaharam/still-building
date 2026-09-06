-- 나가는 일정 종류 넓히기
--
-- 처음에는 외출·외박·휴가·말출 네 가지였다. 평일에 잠깐 나가는 것과 포상으로
-- 받는 특별외출은 성격이 달라서 갈랐고, 아무 일정도 없는 OFF 를 더했다.
--
-- 이미 쌓인 행은 건드리지 않는다. 기존 'outing' 이 그대로 평일외출이 된다.
-- 잘못 들어간 값이 있으면 아래 제약을 걸 때 에러가 나므로, 먼저
--   select kind, count(*) from public.service_leaves group by kind;
-- 로 확인하고 옮긴 뒤에 실행하면 된다.
--
-- 전역일은 여기 넣지 않는다. 날짜가 lib/service.ts 에 이미 있어서 손으로 한 번
-- 더 적으면 둘이 어긋날 자리만 생긴다. 달력이 그 날짜를 직접 칠한다.

alter table public.service_leaves
  drop constraint if exists service_leaves_kind_check;

alter table public.service_leaves
  add constraint service_leaves_kind_check check (
    kind in ('outing', 'special_outing', 'overnight', 'leave', 'final', 'off')
  );
