import { describe, expect, it } from 'vitest';
import { youtubeId } from '@/lib/playlist';

describe('youtubeId', () => {
  it.each([
    ['https://www.youtube.com/watch?v=QKK_xchL8j8', 'QKK_xchL8j8'],
    ['https://youtu.be/xpHFBuDeP_4', 'xpHFBuDeP_4'],
    ['https://youtu.be/xpHFBuDeP_4?si=_4NG6IDEBdXHvkzf', 'xpHFBuDeP_4'],
    [
      'https://www.youtube.com/watch?v=QKK_xchL8j8&list=PL1&index=2',
      'QKK_xchL8j8',
    ],
    ['https://www.youtube.com/embed/QKK_xchL8j8', 'QKK_xchL8j8'],
    ['https://www.youtube.com/shorts/QKK_xchL8j8', 'QKK_xchL8j8'],
  ])('%s 에서 ID를 뽑는다', (url, expected) => {
    expect(youtubeId(url)).toBe(expected);
  });

  it.each([
    'https://example.com/watch?v=QKK_xchL8j8x',
    'https://www.youtube.com/playlist?list=PL1',
    '그냥 문자열',
    '',
  ])('%s 는 null', (url) => {
    expect(youtubeId(url)).toBeNull();
  });
});
