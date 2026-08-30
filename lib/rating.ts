import { MAX_RATING, MIN_RATING } from './types';

/**
 * 별점을 별 문자열로.
 *
 * 화면에는 채운 별과 빈 별을 같이 그려야 몇 점인지 한눈에 들어온다.
 * ★★★☆☆ 처럼.
 */
export function stars(rating: number | null): string {
  if (!isRating(rating)) return '';
  return '★'.repeat(rating) + '☆'.repeat(MAX_RATING - rating);
}

/**
 * DB 는 1~5 로 제한하지만 값이 어긋난 채로 들어올 수 있다. 옛 데이터거나
 * 제약을 걸기 전에 넣었거나. 화면이 깨지느니 별을 안 그리는 쪽이 낫다.
 */
export function isRating(value: number | null): value is number {
  return (
    typeof value === 'number' &&
    Number.isInteger(value) &&
    value >= MIN_RATING &&
    value <= MAX_RATING
  );
}

/** 별점을 '4/5' 처럼. 스크린리더가 읽을 문구로 쓴다. */
export function ratingLabel(rating: number | null): string {
  return isRating(rating) ? `5점 만점에 ${rating}점` : '';
}
