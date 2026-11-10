import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { PRIVATE_BUCKET, PUBLIC_BUCKET } from '@/lib/buckets';

/**
 * 비공개 사진이 새는 길을 막는다.
 *
 * 사진은 글과 다르다. 글은 행을 숨기면 끝이지만 사진은 파일이라, 행을 숨겨도
 * 파일이 공개 버킷에 있으면 주소를 아는 사람에게 그대로 보인다. 게다가
 * post-images 는 select 정책이 bucket_id 만 보기 때문에 anon 키로 목록까지
 * 뽑힌다 — anon 키는 페이지 소스에 그대로 있다.
 *
 * 그래서 두 겹이 다 필요하고, 둘 다 컴파일러가 못 본다.
 */
const ROOT = process.cwd();
const read = (path: string) => readFileSync(join(ROOT, path), 'utf8');

const sql = read('supabase/15-photos.sql');
const route = read('app/api/photos/private/route.ts');
const editor = read('components/admin/PhotoEditor.tsx');

describe('버킷', () => {
  it('공개와 비공개가 서로 다른 버킷이다', () => {
    expect(PUBLIC_BUCKET).not.toBe(PRIVATE_BUCKET);
  });

  it('비공개 버킷은 public = false 로 만든다', () => {
    expect(sql).toContain("values ('private-photos', 'private-photos', false)");
    // 이미 있던 버킷이 공개로 남아 있지 않게 덮어쓴다.
    expect(sql).toContain('do update set public = false');
  });

  it('비공개 버킷에 공개 읽기 정책이 없다', () => {
    // 'using (bucket_id = ...)' 에 주인 확인이 빠진 정책이 하나라도 있으면
    // 그 순간 비공개가 아니게 된다.
    const policies = [
      ...sql.matchAll(/using \(bucket_id = '([^']+)'([^)]*)\)/g),
    ];
    const privateOnes = policies.filter((m) => m[1] === PRIVATE_BUCKET);
    expect(privateOnes.length).toBeGreaterThan(0);
    for (const match of privateOnes) {
      expect(match[2]).toContain('is_owner');
    }
  });

  it('관리자는 앨범에 따라 버킷을 갈라 올린다', () => {
    expect(editor).toContain('PRIVATE_BUCKET');
    expect(editor).toContain('PUBLIC_BUCKET');
  });
});

describe('표', () => {
  it('공개 목록 조회가 album 을 직접 거른다', () => {
    // RLS 만 믿지 않는다. 정책이 어긋나거나 이 조회가 서버 키를 쓰게 되면
    // 비공개 사진이 그대로 실린다. 사진은 한 번 새면 주워담을 수가 없다.
    expect(read('lib/photos.ts')).toContain("eq('album', 'public')");
  });

  it('공개 목록 정책이 album = public 만 내준다', () => {
    expect(sql).toContain("using (album = 'public')");
  });

  it('open_photos 는 비밀번호를 대조하고 private 만 돌려준다', () => {
    expect(sql).toContain('crypt(p_password, password_hash)');
    expect(sql).toContain("where album = 'private'");
    // security definer 가 아니면 함수가 RLS 에 걸려 아무것도 못 읽는다.
    expect(sql).toContain('security definer');
    // crypt() 가 extensions 에 살아서 경로에 없으면 늘 실패한다.
    expect(sql).toContain('set search_path = public, extensions');
  });

  it('비밀번호 표에는 정책을 만들지 않는다', () => {
    expect(sql).toContain(
      'alter table public.photo_access enable row level security'
    );
    expect(sql).not.toMatch(/create policy[^;]*on public\.photo_access/);
  });
});

describe('서버 통로', () => {
  it('서버 전용 키를 브라우저로 내리지 않는다', () => {
    expect(route).toContain('process.env.SUPABASE_SERVICE_ROLE_KEY');
    // NEXT_PUBLIC_ 이 붙으면 번들에 박혀서 페이지 소스에 그대로 실린다.
    expect(route).not.toContain('NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY');
  });

  it('표를 직접 읽지 않고 open_photos 를 거친다', () => {
    // 서버 키는 RLS 를 지나치므로 photos 를 직접 읽으면 비밀번호 검사가 사라진다.
    expect(route).toContain("rpc('open_photos'");
    expect(route).not.toMatch(/\.from\(\s*'photos'\s*\)/);
  });

  it('임시 주소를 발급한다', () => {
    expect(route).toContain('createSignedUrls');
  });
});

describe('비밀번호', () => {
  /*
    값은 Supabase SQL Editor 창에서만 넣는다. 이 저장소는 공개라, 한 번
    커밋되면 나중에 지워도 커밋 기록에 그대로 남는다.

    '원문이 없다' 를 직접 확인할 수는 없다. 찾으려면 찾을 값을 테스트에
    적어야 하는데 이 파일도 같이 커밋된다. 그래서 대신 비밀번호를 넣는
    문장이 주석으로만 있는지, 자리표시자를 쓰는지를 본다.
  */
  const setters = ['supabase/15-photos.sql', 'supabase/02-counts-diary.sql'];

  it.each(setters)('%s 는 자리표시자를 쓴다', (path) => {
    expect(read(path)).toContain('여기에_비밀번호');
  });

  it.each(setters)('%s 의 crypt 문장이 전부 주석이다', (path) => {
    const live = read(path)
      .split('\n')
      .filter((line) => !line.trimStart().startsWith('--'))
      .filter((line) => line.includes("crypt('"));

    expect(live).toEqual([]);
  });
});
