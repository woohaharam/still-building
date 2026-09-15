import { cache } from 'react';
import { supabaseClient } from './supabase';
import { Duty } from './types';

/**
 * 근무 기록 전부.
 *
 * 나가는 일정과 마찬가지로 실패해도 던지지 않는다 (lib/leaves.ts 참고).
 * 못 불러오면 빈 명세서가 나올 뿐, 화면 전체가 에러로 덮이지는 않는다.
 *
 * 계산은 lib/duty.ts 에 있다. 순수 함수를 여기 두면 테스트가 Supabase
 * 클라이언트를 끌고 들어와 환경변수 없이 터진다.
 */
export const getDuties = cache(async function getDuties(): Promise<Duty[]> {
  const { data, error } = await supabaseClient
    .from('service_duties')
    .select('*')
    .order('served_on', { ascending: false });

  if (error) {
    console.error('근무 기록을 불러오지 못했어요:', error.message);
    return [];
  }

  return data as Duty[];
});
