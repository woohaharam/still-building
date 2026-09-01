/** 국내로 볼 나라. 목록을 국내와 해외로 가르는 기준이다. */
export const HOME_COUNTRY = 'KR';

/** ISO 3166-1 alpha-2 두 글자인지. 아니면 국기도 이름도 만들 수 없다. */
export function isCountryCode(code: string): boolean {
  return /^[A-Za-z]{2}$/.test(code.trim());
}

/**
 * 국가 코드를 국기 이모지로.
 *
 * 국기 이모지는 그림이 아니라 지역 표시 문자(regional indicator) 두 개를
 * 이어붙인 것이다. 'K' 와 'R' 을 각각 U+1F1E6 부터 세어 옮기면 🇰🇷 이 된다.
 * 그래서 나라마다 이미지를 들고 있을 필요가 없다.
 */
export function flagEmoji(code: string): string {
  if (!isCountryCode(code)) return '';
  const upper = code.trim().toUpperCase();
  return String.fromCodePoint(
    ...[...upper].map((letter) => 0x1f1e6 + letter.charCodeAt(0) - 65)
  );
}

/**
 * 국가 코드를 한글 나라 이름으로. 'JP' 면 '일본'.
 *
 * 나라 이름표를 직접 들고 있지 않아도 된다. 다만 모르는 코드에는 '알려지지
 * 않은 지역' 같은 문구를 돌려주므로, 그건 코드 그대로 보여주는 편이 낫다.
 */
export function countryName(code: string): string {
  if (!isCountryCode(code)) return code;
  const upper = code.trim().toUpperCase();

  try {
    const name = new Intl.DisplayNames(['ko'], { type: 'region' }).of(upper);
    // 모르는 코드면 코드를 그대로 돌려주거나 안내 문구를 준다.
    return !name || name === upper || name.includes('알려지지') ? upper : name;
  } catch {
    return upper;
  }
}

export function isDomestic(code: string): boolean {
  return code.trim().toUpperCase() === HOME_COUNTRY;
}
