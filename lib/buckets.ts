/**
 * 사진이 들어가는 곳.
 *
 * 이름만 담는다. supabase 클라이언트를 부르지 않아서 어디서든 — 서버에서도
 * 테스트에서도 — 그냥 읽을 수 있다.
 *
 * 둘을 가르는 것이 비공개 사진첩의 전부다. 같은 버킷에 넣으면 표에서 행을
 * 숨겨도 파일은 그대로 보인다 (supabase/15-photos.sql 참고).
 */

/** 누구나 읽을 수 있다. 글에 넣는 사진과 공개 사진첩이 함께 쓴다. */
export const PUBLIC_BUCKET = 'post-images';

/** 읽기가 주인에게만 열려 있다. 보여줄 때마다 임시 주소를 발급해야 한다. */
export const PRIVATE_BUCKET = 'private-photos';
