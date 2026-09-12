/*
  ESLint 9 부터는 이 파일이 설정이다. 예전의 .eslintrc.json 은 안 읽는다.

  Next 16 에는 next lint 명령이 없어져서 eslint 를 직접 부른다.
  eslint-config-next 16 은 이 형식으로 바로 내보내므로 변환 계층이 필요 없다.
*/
import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';

const config = [
  { ignores: ['.next/**', 'next-env.d.ts'] },
  ...nextCoreWebVitals,
];

export default config;
