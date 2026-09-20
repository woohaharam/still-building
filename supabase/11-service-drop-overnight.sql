-- 외박 빼기
--
-- 부대에 외박이라는 구분이 없어서 고를 일이 없는 칸이었다.
--
-- 이미 'overnight' 으로 저장된 행이 있으면 제약을 거는 순간 에러가 난다.
-- 그래서 먼저 옮기고 제약을 건다. 외박은 나갔다 자고 오는 것이니 휴가에
-- 제일 가깝다. 옮기기 전에 몇 건인지 보고 싶으면 이것부터 돌리면 된다.
--
--   select kind, count(*) from public.service_leaves group by kind;

update public.service_leaves
   set kind = 'leave'
 where kind = 'overnight';

alter table public.service_leaves
  drop constraint if exists service_leaves_kind_check;

alter table public.service_leaves
  add constraint service_leaves_kind_check check (
    kind in ('outing', 'special_outing', 'leave', 'final', 'off')
  );
