/*
  기술 로고를 굽는다.

  실행: node scripts/build-tech-icons.mjs  →  lib/tech-icons.ts

  simple-icons 는 이 스크립트에서만 쓴다. 결과물을 저장소에 넣어두므로
  배포에는 딸려가지 않는다 (scripts/build-map.mjs 와 같은 방식).

  색을 그대로 쓰지 않고 테마마다 한 번씩 손본다. 브랜드 색은 흰 바탕을
  전제로 고른 것이라, Vercel·Next.js 처럼 검은 로고는 어두운 테마에서 배경에
  묻히고 JavaScript 의 노랑은 밝은 테마에서 날아간다. 색조는 그대로 두고
  명도만 옮겨서 양쪽 배경에서 3:1 을 넘기게 한다 (WCAG 의 그래픽 기준).
*/
import { writeFileSync } from 'node:fs';
import * as icons from 'simple-icons';

/** 어느 로고를 어느 이름으로 쓸지. lib/tech.ts 가 이 열쇠로 찾는다. */
const WANTED = [
  'typescript',
  'javascript',
  'html5',
  'css',
  'nextdotjs',
  'tailwindcss',
  'supabase',
  'reactquery',
  'vercel',
  'githubactions',
  'vitest',
];

/** 로고가 얹히는 배경. globals.css 의 --surface 값이다. 둘 중 빡빡한 쪽이다. */
const SURFACE = { light: [243, 239, 231], dark: [38, 34, 29] };

/**
 * 그림 대비 기준. 본문 글씨(4.5)보다 낮다 — 로고는 글자가 아니다.
 *
 * 3.0 이 아니라 3.2 인 건 여유다. 딱 맞춰두면 배경을 한 톤만 손봐도 바로
 * 밑으로 떨어진다.
 */
const MIN_CONTRAST = 3.2;

/** 이 밑이면 무채색으로 본다. 검은 로고(Vercel·Next.js)가 여기 걸린다. */
const GREY = 0.05;

function channel(value) {
  const c = value / 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

function luminance([r, g, b]) {
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

function contrast(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

function hexToRgb(hex) {
  return [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16));
}

function toHex([r, g, b]) {
  return `#${[r, g, b].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('')}`;
}

/* HSL 로 오가며 색조와 채도는 두고 명도만 움직인다. */

function rgbToHsl([r, g, b]) {
  const [R, G, B] = [r / 255, g / 255, b / 255];
  const max = Math.max(R, G, B);
  const min = Math.min(R, G, B);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];

  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  const h =
    max === R
      ? ((G - B) / d + (G < B ? 6 : 0)) / 6
      : max === G
        ? ((B - R) / d + 2) / 6
        : ((R - G) / d + 4) / 6;

  return [h, s, l];
}

function hslToRgb([h, s, l]) {
  if (s === 0) return [l * 255, l * 255, l * 255];

  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const at = (t) => {
    const x = (t + 1) % 1;
    if (x < 1 / 6) return p + (q - p) * 6 * x;
    if (x < 1 / 2) return q;
    if (x < 2 / 3) return p + (q - p) * (2 / 3 - x) * 6;
    return p;
  };

  return [at(h + 1 / 3) * 255, at(h) * 255, at(h - 1 / 3) * 255].map((v) => v);
}

/**
 * 배경에서 3:1 이 나올 때까지 명도만 옮긴 색.
 *
 * 이미 충분하면 브랜드 색 그대로 둔다. 모자라면 밝은 배경에서는 어둡게,
 * 어두운 배경에서는 밝게 — 한 걸음씩 옮기다 넘어서는 순간 멈춘다. 끝까지
 * 가도 안 되면(회색에 가까운 색) 마지막 값을 쓴다.
 */
function fit(hex, background) {
  const rgb = hexToRgb(hex);
  if (contrast(rgb, background) >= MIN_CONTRAST) return toHex(rgb);

  const [h, s] = rgbToHsl(rgb);
  const darken = luminance(background) > 0.2;
  let best = rgb;

  for (let step = 1; step <= 100; step += 1) {
    const l = darken ? 0.5 - (step / 100) * 0.5 : 0.5 + (step / 100) * 0.5;
    best = hslToRgb([h, s, l]);
    if (contrast(best, background) >= MIN_CONTRAST) break;
  }

  return toHex(best);
}

/**
 * 작은따옴표로 감싼 문자열.
 *
 * JSON.stringify 는 큰따옴표로 낸다. 이 저장소의 prettier 설정은 작은따옴표라,
 * 구운 파일이 매번 format:check 에 걸린다. lib/map-data.ts 와 같은 이유로
 * .prettierignore 에 넣지 않고 처음부터 맞는 모양으로 낸다.
 */
function quote(value) {
  return `'${value.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
}

const entries = WANTED.map((slug) => {
  const icon = icons[`si${slug[0].toUpperCase()}${slug.slice(1)}`];
  if (!icon) throw new Error(`simple-icons 에 ${slug} 가 없다`);

  /*
    무채색 로고는 색을 굽지 않고 글자색을 따라가게 둔다.

    명도만 옮기는 방식은 색조가 있어야 뜻이 있다. 검은 로고에 그걸 걸면
    기준을 넘는 순간 멈춰서 어중간한 회색(#818181)이 나온다. 원래 검은 마크는
    어두운 배경에서 흰색이 되는 게 맞고, 그건 이미 --ink 가 하는 일이다.
  */
  const [, saturation] = rgbToHsl(hexToRgb(icon.hex));
  const mono = saturation < GREY;

  return {
    slug,
    title: icon.title,
    path: icon.path,
    light: mono ? null : fit(icon.hex, SURFACE.light),
    dark: mono ? null : fit(icon.hex, SURFACE.dark),
  };
});

const body = entries
  .map(
    ({ slug, title, path, light, dark }) =>
      `  ${slug}: {\n` +
      `    title: ${quote(title)},\n` +
      `    light: ${light === null ? 'null' : `'${light}'`},\n` +
      `    dark: ${dark === null ? 'null' : `'${dark}'`},\n` +
      `    path: ${quote(path)},\n` +
      `  },`
  )
  .join('\n');

writeFileSync(
  new URL('../lib/tech-icons.ts', import.meta.url),
  `// scripts/build-tech-icons.mjs 가 만든 파일이다. 손으로 고치지 않는다.
//
// 로고는 각 상표권자의 것이다. 여기서는 어떤 기술을 다루는지 가리키는 데만 쓴다.

export interface TechIcon {
  /** 상표 그대로의 이름. 화면에 쓰는 이름과 다를 수 있다. */
  title: string;
  /**
   * 밝은 테마에서 쓸 색. 브랜드 색에서 명도만 옮겨 배경 대비를 맞춘 값.
   *
   * null 은 무채색 로고라는 뜻이다. 그때는 글자색을 그대로 따라간다.
   */
  light: string | null;
  dark: string | null;
  /** 24x24 뷰박스 기준의 외곽선 하나. */
  path: string;
}

export const TECH_ICONS: Record<string, TechIcon> = {
${body}
};
`
);

for (const { slug, light, dark } of entries) {
  if (light === null) {
    console.log(slug.padEnd(14), '무채색 — 글자색을 따라간다');
    continue;
  }

  console.log(
    slug.padEnd(14),
    light,
    contrast(hexToRgb(light.slice(1)), SURFACE.light).toFixed(2),
    '/',
    dark,
    contrast(hexToRgb(dark.slice(1)), SURFACE.dark).toFixed(2)
  );
}
