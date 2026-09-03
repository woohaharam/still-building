import { cache } from 'react';
import { supabaseClient } from './supabase';
import { Leave } from './types';

/**
 * 나가는 일정 전부.
 *
 * 캘린더의 일정과 달리 실패해도 던지지 않는다. 이 표는 전역 카운터 옆에
 * 붙는 곁가지라, 못 불러왔다고 화면 전체를 에러로 덮을 이유가 없다.
 *
 * 날짜 계산은 lib/leave-dates.ts 에 있다. 순수 함수를 여기 두면 테스트가
 * Supabase 클라이언트를 끌고 들어와 환경변수 없이 터진다.
 */
export const getLeaves = cache(async function getLeaves(): Promise<Leave[]> {
  const { data, error } = await supabaseClient
    .from('service_leaves')
    .select('*')
    .order('started_on', { ascending: false });

  if (error) {
    console.error('나가는 일정을 불러오지 못했어요:', error.message);
    return [];
  }

  return data as Leave[];
});
