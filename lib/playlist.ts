export interface Track {
  /** 유튜브 주소를 그대로 붙여넣으면 돼요. watch / youtu.be / shorts 다 됩니다. */
  url: string;
  /** 비워두면 유튜브에 올라간 영상 제목을 그대로 가져와서 보여줘요. */
  title?: string;
}

/**
 * 블로그에 깔리는 노래 목록. 순서대로 재생되고, 마지막 곡이 끝나면 처음으로 돌아간다.
 * 곡을 바꾸려면 유튜브에서 '공유' 눌러서 나온 주소를 url 자리에 붙여넣기만 하면 됩니다.
 */
export const PLAYLIST: Track[] = [
  { url: 'https://youtu.be/QKK_xchL8j8' },
  { url: 'https://youtu.be/xpHFBuDeP_4' },
];

function isVideoId(value: string | null): value is string {
  return !!value && /^[A-Za-z0-9_-]{11}$/.test(value);
}

/**
 * 유튜브 주소에서 영상 ID(11글자)만 뽑아낸다.
 * 주소를 통째로 뜯어보기 때문에 유튜브가 아닌 주소는 걸러집니다.
 * (예전에는 `?v=`만 보고 있어서 아무 사이트 주소나 통과했어요.)
 */
export function youtubeId(url: string): string | null {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }

  const host = parsed.hostname.replace(/^(?:www|m|music)\./, '');

  if (host === 'youtu.be') {
    const id = parsed.pathname.slice(1);
    return isVideoId(id) ? id : null;
  }

  if (host !== 'youtube.com' && host !== 'youtube-nocookie.com') return null;

  // /watch?v=ID — 다른 파라미터가 앞에 붙어 있어도 상관없다.
  const fromQuery = parsed.searchParams.get('v');
  if (isVideoId(fromQuery)) return fromQuery;

  // /embed/ID, /shorts/ID, /live/ID, /v/ID
  const fromPath = parsed.pathname.match(
    /^\/(?:embed|shorts|live|v)\/([A-Za-z0-9_-]{11})(?:$|[/?#])/
  );
  return fromPath ? fromPath[1] : null;
}

/** 주소가 잘못 적힌 곡은 아예 목록에서 빼요. */
export const TRACKS = PLAYLIST.map((track) => ({
  ...track,
  videoId: youtubeId(track.url),
})).filter((track): track is Track & { videoId: string } => !!track.videoId);
