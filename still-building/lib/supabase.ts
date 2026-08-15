import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// 앱 전체에서 이 이름으로 사용 (다른 supabase 프로젝트와 변수명 충돌 방지)
export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
