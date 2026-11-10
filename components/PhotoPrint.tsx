import { formatDate } from '@/lib/calendar';
import { PhotoWithUrl } from '@/lib/types';

/**
 * 한 장씩 뽑아둔 인화물처럼 보이게 감싼다.
 *
 * 사진 아래에만 여백을 더 둔다. 인화지에서 글씨를 적는 자리가 거기라,
 * 사방을 같게 두면 사진첩이 아니라 그냥 카드로 보인다.
 *
 * 적은 글이 없어도 그 여백은 남긴다. 글이 있을 때만 넓어지면 격자에서
 * 칸 높이가 들쭉날쭉해지고, 빈 인화지라는 느낌도 사라진다.
 */
export default function PhotoPrint({
  photo,
  priority = false,
}: {
  photo: PhotoWithUrl;
  priority?: boolean;
}) {
  const written = photo.title || photo.caption;

  return (
    <figure className="flex h-full flex-col bg-print p-2.5 pb-3 shadow-[0_1px_3px_rgba(0,0,0,0.10),0_6px_16px_-8px_rgba(0,0,0,0.18)]">
      {/*
        next/image 가 아니라 img 다. 비공개 사진의 주소는 한 시간마다
        달라지는 서명 주소라서 최적화 서버가 캐시할 고정 주소가 아니다.
      */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={photo.url}
        /*
          적어둔 글이 바로 아래에 있으면 alt 를 비운다. 같은 말을 두 번
          읽어주게 되고, 버튼의 이름에도 두 번 들어간다. 글이 없을 때만
          사진이 있다는 것을 알린다.
        */
        alt={written ? '' : '사진'}
        loading={priority ? 'eager' : 'lazy'}
        className="aspect-square w-full bg-surface object-cover"
      />

      {/*
        글이 있든 없든 위에서부터 쌓는다. 가운데로 모으면 글이 없는 장의
        날짜만 혼자 아래로 내려가서, 나란히 놓았을 때 글 시작선이 어긋난다.
      */}
      <figcaption className="flex min-h-[2.75rem] flex-col px-1 pt-2.5 text-left">
        {written && (
          <p className="line-clamp-2 text-[13px] leading-snug text-print-ink">
            {written}
          </p>
        )}
        {photo.taken_on && (
          // 위 간격은 글이 있을 때만. 글 없는 장에서까지 띄우면 그 장의
          // 날짜만 혼자 내려가 보인다.
          <p
            className={`text-[11px] text-print-muted ${written ? 'mt-0.5' : ''}`}
          >
            {formatDate(photo.taken_on)}
          </p>
        )}
      </figcaption>
    </figure>
  );
}
