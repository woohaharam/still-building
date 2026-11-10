import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { beforeEach, describe, expect, it } from 'vitest';
import {
  checkRateLimit,
  clearFailures,
  clientKey,
  recordFailure,
  resetRateLimit,
} from '@/lib/rate-limit';

const WINDOW_MS = 10 * 60 * 1000;
const MAX_FAILURES = 8;

beforeEach(resetRateLimit);

describe('세기', () => {
  it('처음 온 사람은 그냥 통과한다', () => {
    expect(checkRateLimit('1.1.1.1').allowed).toBe(true);
  });

  it('여덟 번까지는 받고 아홉 번째부터 막는다', () => {
    for (let i = 0; i < MAX_FAILURES; i += 1) {
      expect(checkRateLimit('1.1.1.1').allowed).toBe(true);
      recordFailure('1.1.1.1');
    }
    expect(checkRateLimit('1.1.1.1').allowed).toBe(false);
  });

  it('막히면 얼마나 기다릴지 알려준다', () => {
    const now = Date.now();
    for (let i = 0; i < MAX_FAILURES; i += 1) recordFailure('1.1.1.1', now);

    const result = checkRateLimit('1.1.1.1', now + 60_000);
    expect(result.allowed).toBe(false);
    // 10분 창에서 1분이 지났으니 9분쯤 남는다.
    expect(result.retryAfterSeconds).toBeGreaterThan(530);
    expect(result.retryAfterSeconds).toBeLessThanOrEqual(540);
  });

  it('창이 지나면 다시 받는다', () => {
    const now = Date.now();
    for (let i = 0; i < MAX_FAILURES; i += 1) recordFailure('1.1.1.1', now);

    expect(checkRateLimit('1.1.1.1', now + WINDOW_MS + 1).allowed).toBe(true);
  });

  it('맞히면 쌓인 실패가 사라진다', () => {
    for (let i = 0; i < MAX_FAILURES; i += 1) recordFailure('1.1.1.1');
    clearFailures('1.1.1.1');
    expect(checkRateLimit('1.1.1.1').allowed).toBe(true);
  });

  it('한 사람이 막혀도 다른 사람은 멀쩡하다', () => {
    for (let i = 0; i < MAX_FAILURES; i += 1) recordFailure('1.1.1.1');
    expect(checkRateLimit('1.1.1.1').allowed).toBe(false);
    expect(checkRateLimit('2.2.2.2').allowed).toBe(true);
  });

  it('오래된 기록은 메모리에서 털어낸다', () => {
    // 안 털면 찔러보는 쪽이 주소를 바꿔가며 메모리를 불릴 수 있다.
    const now = Date.now();
    for (let i = 0; i < 1200; i += 1) recordFailure(`10.0.0.${i}`, now);

    // 창이 지난 뒤 한 번 더 세면 지나간 것들이 함께 정리된다.
    checkRateLimit('9.9.9.9', now + WINDOW_MS + 1);
    expect(checkRateLimit('10.0.0.5', now + WINDOW_MS + 1).allowed).toBe(true);
  });
});

describe('누구인지 가리기', () => {
  const withHeaders = (headers: Record<string, string>) =>
    new Request('https://example.com', { headers });

  it('x-forwarded-for 의 맨 앞을 쓴다', () => {
    // 뒤쪽은 거쳐 온 프록시들이다. 실제 주소는 맨 앞에 온다.
    expect(
      clientKey(withHeaders({ 'x-forwarded-for': '1.2.3.4, 5.6.7.8' }))
    ).toBe('1.2.3.4');
  });

  it('둘 다 없으면 한 덩어리로 묶는다', () => {
    // 아무도 안 세는 것보다는 낫다.
    expect(clientKey(withHeaders({}))).toBe('unknown');
  });
});

describe('통로에 실제로 걸려 있는지', () => {
  const routes = {
    사진첩: 'app/api/photos/private/route.ts',
    일기장: 'app/api/diary/route.ts',
  };
  const route = readFileSync(join(process.cwd(), routes.사진첩), 'utf8');
  const read = (path: string) =>
    readFileSync(join(process.cwd(), path), 'utf8');

  it.each(Object.entries(routes))('%s 통로가 횟수를 센다', (_, path) => {
    const source = read(path);
    expect(source).toContain('checkRateLimit');
    expect(source).toContain('recordFailure(key)');
    expect(source).toContain('clearFailures(key)');
    expect(source).toContain('status: 429');
  });

  it.each(Object.entries(routes))(
    '%s 는 몸통보다 한도를 먼저 본다',
    (_, path) => {
      const source = read(path);
      expect(source.indexOf('checkRateLimit(key)')).toBeLessThan(
        source.indexOf('await request.json()')
      );
    }
  );

  it('두 통로가 서로 다른 칸에 센다', () => {
    // 한 통로에서 틀렸다고 다른 통로까지 막히면, 사진 비밀번호를 헤맨
    // 사람이 일기도 못 열게 된다.
    expect(read(routes.사진첩)).toContain('`photo:${clientKey(request)}`');
    expect(read(routes.일기장)).toContain('`diary:${clientKey(request)}`');
  });

  it('일기를 브라우저에서 직접 부르지 않는다', () => {
    // 브라우저가 DB 를 바로 부르면 셀 자리가 없다.
    const diary = read('lib/diary.ts');
    expect(diary).toContain("fetch('/api/diary'");
    expect(diary).not.toContain('supabaseClient');
  });

  it('틀리면 세고, 맞으면 턴다', () => {
    expect(route).toContain('recordFailure(key)');
    expect(route).toContain('clearFailures(key)');
  });

  it('막을 때 429 와 Retry-After 를 준다', () => {
    expect(route).toContain('status: 429');
    expect(route).toContain("'Retry-After'");
  });

  it('막을 상대의 몸통은 읽지도 않는다', () => {
    /*
      이미 막힌 쪽의 요청을 파싱해줄 이유가 없다. 키는 헤더에서 나온다.

      찾는 것이 호출 자리여야 한다. 'checkRateLimit' 으로만 찾으면 맨 위의
      import 가 먼저 걸려서, 순서를 거꾸로 뒤집어도 통과한다. 실제로 뒤집어
      보고 알았다.
    */
    const call = route.indexOf('checkRateLimit(key)');
    const parse = route.indexOf('await request.json()');

    expect(call).toBeGreaterThan(-1);
    expect(parse).toBeGreaterThan(-1);
    expect(call).toBeLessThan(parse);
  });

  it('비밀번호 길이를 자른다', () => {
    // 막지 않으면 수 MB 짜리 문자열이 그대로 crypt() 까지 간다.
    expect(route).toContain('MAX_PASSWORD_LENGTH');
  });
});
