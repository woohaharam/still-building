-- 복무 일정 종류 세 가지 더하기
--
-- 시험외출 · 수도병원 · 기타. 셋 다 부대 밖으로 나가는 건 같지만 나가는
-- 이유가 달라서, 한 덩어리로 묶여 있으면 나중에 돌아볼 때 구분이 안 된다.
--
--   exam_outing  시험외출 — 시험 보러 나가는 것
--   hospital     수도병원 — 국군수도병원 진료
--   other        기타     — 위에 안 맞는 것
--
-- 종류를 더하는 것뿐이라 기존 행은 건드리지 않는다. 제약을 넓히는 방향이니
-- 이미 저장된 값은 전부 그대로 통과한다.
--
-- 출영·복귀 시각은 기본값을 두지 않았다(lib/service.ts 의 LEAVE_SCHEDULE).
-- 시험 시간표나 진료 예약에 따라 매번 달라져서 일정마다 적는 쪽이 맞다.

alter table public.service_leaves
  drop constraint if exists service_leaves_kind_check;

alter table public.service_leaves
  add constraint service_leaves_kind_check check (
    kind in (
      'outing',
      'special_outing',
      'leave',
      'final',
      'off',
      'exam_outing',
      'hospital',
      'other'
    )
  );
