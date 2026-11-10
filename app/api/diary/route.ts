import { supabaseClient } from '@/lib/supabase';
import {
  checkRateLimit,
  clearFailures,
  clientKey,
  recordFailure,
} from '@/lib/rate-limit';

/** 받아줄 비밀번호 길이의 위. 사람이 치는 값이라 넉넉하게 잡아도 이 정도다. */
const MAX_PASSWORD_LENGTH = 200;

export const revalidate = 0;

/**
 * 일기를 여는 통로.
 *
 * 예전에는 브라우저가 open_diary 를 직접 불렀다. 대조는 DB 안에서 하니
 * 안전했지만 횟수를 세는 자리가 없었다 — 짧은 비밀번호는 반복해서 찔러보면
 * 뚫린다. 사진첩에서 재어 보니 막지 않으면 초당 88 번까지 들어간다.
 *
 * 그래서 서버를 한 겹 두고 여기서 센다. 사진첩과 달리 서버 전용 키가 필요
 * 없다 — 임시 주소를 발급할 일이 없고, open_diary 는 anon 에게도 열려 있다.
 */
export async function POST(request: Request) {
  /*
    막을 상대인지 먼저 본다. 키는 헤더에서 나오므로 몸통을 읽지 않아도 된다.

    'diary:' 를 앞에 붙여 사진첩과 따로 센다. 한 통로에서 틀렸다고 다른
    통로까지 막히면, 사진 비밀번호를 헤맨 사람이 일기도 못 열게 된다.
  */
  const key = `diary:${clientKey(request)}`;
  const limit = checkRateLimit(key);

  if (!limit.allowed) {
    return Response.json(
      { message: '너무 여러 번 틀렸어요. 잠시 뒤에 다시 시도해주세요.' },
      {
        status: 429,
        headers: { 'Retry-After': String(limit.retryAfterSeconds) },
      }
    );
  }

  let password: unknown;
  try {
    password = (await request.json())?.password;
  } catch {
    password = undefined;
  }

  if (
    typeof password !== 'string' ||
    !password ||
    password.length > MAX_PASSWORD_LENGTH
  ) {
    return Response.json(
      { message: '비밀번호를 입력해주세요.' },
      { status: 400 }
    );
  }

  const { data, error } = await supabaseClient.rpc('open_diary', {
    p_password: password,
  });

  if (error) {
    // 28000 은 open_diary 가 비밀번호 불일치에 쓰는 코드다.
    if (error.code === '28000' || /비밀번호/.test(error.message ?? '')) {
      recordFailure(key);
      return Response.json(
        { message: '비밀번호가 맞지 않아요.' },
        { status: 401 }
      );
    }

    // 함수가 없다 — 마이그레이션을 아직 안 돌렸다.
    if (error.code === 'PGRST202' || /open_diary/.test(error.message ?? '')) {
      return Response.json(
        { message: '일기 기능이 아직 준비되지 않았어요. (마이그레이션 필요)' },
        { status: 503 }
      );
    }

    // crypt 를 못 찾는다 — search_path 에 extensions 가 빠졌다.
    if (error.code === '42883' || /crypt/.test(error.message ?? '')) {
      return Response.json(
        { message: '서버 설정이 덜 끝났어요. (pgcrypto 경로 확인 필요)' },
        { status: 503 }
      );
    }

    console.error('open_diary 실패:', error);
    return Response.json(
      { message: '지금은 열 수 없어요. 잠시 뒤에 다시 시도해주세요.' },
      { status: 500 }
    );
  }

  // 맞았으니 쌓인 실패를 턴다.
  clearFailures(key);

  return Response.json({ posts: data ?? [] });
}
