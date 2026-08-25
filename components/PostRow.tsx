import { formatDate } from '@/lib/date';
import { formatCount } from '@/lib/count';
import { readingMinutes } from '@/lib/reading';
import { thumbnailOf } from '@/lib/thumbnail';
import { Post, tagLabel } from '@/lib/types';

/**
 * 목록에 걸리는 글 한 줄.
 *
 * 감싸는 요소는 부모가 정한다. 블로그 목록은 다른 주소로 가니까 Link 로,
 * 일기는 같은 화면에서 펼치니까 button 으로 감싼다. 그래서 안쪽은 전부
 * span 이다. button 안에 div 나 p 가 들어가면 유효하지 않은 마크업이 된다.
 */
export default function PostRow({
  post,
  showTags = true,
}: {
  post: Post;
  /** 일기는 태그가 하나뿐이라 굳이 보여주지 않는다. */
  showTags?: boolean;
}) {
  const thumbnail = thumbnailOf(post);

  return (
    <>
      <span className="min-w-0 flex-1">
        <span className="block text-lg font-semibold transition-colors group-hover:text-accent">
          {post.title}
        </span>

        {post.excerpt && (
          <span className="mt-2 block text-sm leading-relaxed text-ink-soft">
            {post.excerpt}
          </span>
        )}

        <span className="mt-3 flex flex-wrap items-center gap-3 text-xs text-ink-muted">
          <span>{formatDate(post.published_at)}</span>
          <span>읽는 데 {readingMinutes(post.content)}분</span>
          {post.view_count > 0 && (
            <span>조회 {formatCount(post.view_count)}</span>
          )}
          {showTags &&
            post.tags?.map((tag) => {
              const label = tagLabel(tag);
              return label ? <span key={tag}>#{label}</span> : null;
            })}
        </span>
      </span>

      {thumbnail && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={thumbnail}
          alt=""
          loading="lazy"
          className="h-20 w-20 shrink-0 rounded-md border border-line object-cover sm:h-24 sm:w-24"
        />
      )}
    </>
  );
}
