export interface Track {
  title: string;
  /** 유튜브 주소를 그대로 붙여넣으면 돼요. watch / youtu.be / shorts 다 됩니다. */
  url: string;
}

/**
 * 블로그에 깔리는 노래 목록.
 *
 * ⚠️ 아래 곡들은 임시로 채워둔 거예요. 듣고 싶은 곡의 유튜브 주소를 복사해서
 *    url 자리에 붙여넣고 title만 바꾸면 바로 반영됩니다. 순서도 여기 순서를 따라가요.
 *    영상이 '퍼가기 금지'로 걸려 있으면 플레이어가 자동으로 다음 곡으로 넘어가요.
 */
export const PLAYLIST: Track[] = [
  {
    title: '몽글몽글 설레는 달달한 사랑 노래 모음',
    url: 'https://www.youtube.com/watch?v=Itg9PBuwae8',
  },
  {
    title: '썸 탈 때 듣는 노래 모음 (KBS)',
    url: 'https://www.youtube.com/watch?v=WmnT8Ak0QMg',
  },
  {
    title: '이문세 — 사랑은 늘 도망가',
    url: 'https://www.youtube.com/watch?v=LvR6lQTFyT8',
  },
];

/** 유튜브 주소에서 영상 ID(11글자)만 뽑아내요. */
export function youtubeId(url: string): string | null {
  const match = url.match(
    /(?:youtu\.be\/|[?&]v=|\/embed\/|\/shorts\/)([A-Za-z0-9_-]{11})/
  );
  return match ? match[1] : null;
}

/** 주소가 잘못 적힌 곡은 아예 목록에서 빼요. */
export const TRACKS = PLAYLIST.map((track) => ({
  ...track,
  videoId: youtubeId(track.url),
})).filter((track): track is Track & { videoId: string } => !!track.videoId);
