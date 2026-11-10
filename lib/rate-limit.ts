/**
 * 비밀번호를 반복해서 찔러보는 것을 늦춘다.
 *
 * 비밀번호 대조는 DB 가 하고 거기엔 횟수 제한이 없다. 그래서 통로 쪽에서
 * 센다. 안 세면 100 번 찔러보는 데 1 초가 걸린다 — 실제로 재봤다.
 *
 * 한계를 분명히 해둔다. 수를 서버 메모리에 담으므로 인스턴스가 여러 개로
 * 늘어나면 각자 따로 센다. Vercel 처럼 요청마다 인스턴스가 바뀔 수 있는
 * 곳에서는 막는 선이 흐려진다. 이걸로 막을 수 있는 건 '한 대에서 돌리는
 * 스크립트' 정도고, 작정하고 분산해서 때리는 상대는 못 막는다.
 *
 * 그러니 이건 비밀번호를 대신하지 않는다. 짧고 규칙적인 값은 여전히
 * 위험하다. 길이를 늘리는 쪽이 늘 더 효과가 크다.
 */

/** 이 시간 안에 */
const WINDOW_MS = 10 * 60 * 1000;

/** 이만큼 틀리면 창이 끝날 때까지 받지 않는다. */
const MAX_FAILURES = 8;

/** 메모리가 무한정 늘지 않게, 셀 때마다 지나간 것들을 턴다. */
const MAX_TRACKED = 1000;

interface Attempt {
  count: number;
  firstAt: number;
}

const attempts = new Map<string, Attempt>();

function sweep(now: number) {
  for (const [key, attempt] of attempts) {
    if (now - attempt.firstAt > WINDOW_MS) attempts.delete(key);
  }

  // 그래도 넘치면 오래된 것부터 버린다. Map 은 넣은 순서를 지킨다.
  while (attempts.size > MAX_TRACKED) {
    const oldest = attempts.keys().next().value;
    if (oldest === undefined) break;
    attempts.delete(oldest);
  }
}

export interface RateLimitResult {
  allowed: boolean;
  /** 막혔을 때 몇 초 뒤에 다시 받을지. Retry-After 에 그대로 쓴다. */
  retryAfterSeconds: number;
}

/** 지금 받아줄지. 세기만 하고 실패를 기록하지는 않는다. */
export function checkRateLimit(key: string, now = Date.now()): RateLimitResult {
  sweep(now);

  const attempt = attempts.get(key);
  if (!attempt || now - attempt.firstAt > WINDOW_MS) {
    return { allowed: true, retryAfterSeconds: 0 };
  }

  if (attempt.count < MAX_FAILURES) {
    return { allowed: true, retryAfterSeconds: 0 };
  }

  return {
    allowed: false,
    retryAfterSeconds: Math.ceil((WINDOW_MS - (now - attempt.firstAt)) / 1000),
  };
}

/** 틀렸을 때 부른다. */
export function recordFailure(key: string, now = Date.now()) {
  const attempt = attempts.get(key);

  if (!attempt || now - attempt.firstAt > WINDOW_MS) {
    attempts.set(key, { count: 1, firstAt: now });
    return;
  }

  attempt.count += 1;
}

/** 맞았을 때 부른다. 쌓인 실패를 지운다. */
export function clearFailures(key: string) {
  attempts.delete(key);
}

/**
 * 어느 쪽에서 온 요청인지.
 *
 * Vercel 은 x-forwarded-for 맨 앞에 실제 주소를 넣는다. 둘 다 없으면 한
 * 덩어리로 묶어 센다 — 그 경우 서로 다른 사람이 같이 막힐 수 있지만,
 * 아무도 안 세는 것보다는 낫다.
 */
export function clientKey(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return request.headers.get('x-real-ip') ?? 'unknown';
}

/** 테스트에서 쓴다. */
export function resetRateLimit() {
  attempts.clear();
}
