import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
  },
  resolve: {
    // 앱 코드와 같은 '@/' 경로를 테스트에서도 쓸 수 있게 해요.
    alias: { '@': path.resolve(__dirname, '.') },
  },
});
