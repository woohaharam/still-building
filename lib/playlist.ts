export interface Track {
  /** 유튜브 주소를 그대로 붙여넣으면 돼요. watch / youtu.be / shorts 다 됩니다. */
  url: string;
  /** 비워두면 유튜브에 올라간 영상 제목을 그대로 가져와서 보여줘요. */
  title?: string;
}

/**
 * 블로그에 깔리는 노래 목록. 순서대로 재생되고, 마지막 곡이 끝나면 처음으로 돌아가요.
 * 곡을 바꾸려면 유튜브에서 '공유' 눌러서 나온 주소를 url 자리에 붙여넣기만 하면 됩니다.
 */
export const PLAYLIST: Track[] = [
  { url: 'https://youtu.be/QKK_xchL8j8' },
  { url: 'https://youtu.be/xpHFBuDeP_4' },
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
