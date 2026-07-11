import { defineConfig, defineProject } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

const alias = { '@': resolve(__dirname, '.') }

const sharedTestConfig = {
  // forks プールはパスにスペースが含まれる環境でタイムアウトが発生するため threads を使用
  pool: 'threads' as const,
  globals: true,
  setupFiles: ['./vitest.setup.ts'],
  // DB 接続エラーを防ぐためのダミー環境変数
  env: {
    TURSO_DATABASE_URL: 'file:test.db',
    TURSO_AUTH_TOKEN: 'test-token',
    BETTER_AUTH_SECRET: 'test-secret',
  },
}

export default defineConfig({
  plugins: [react()],
  resolve: { alias },
  test: {
    projects: [
      // API ルート・ユーティリティ: Node 環境で実行
      defineProject({
        plugins: [react()],
        resolve: { alias },
        test: {
          ...sharedTestConfig,
          name: 'server',
          include: ['app/api/**/*.test.ts', 'lib/**/*.test.ts'],
          environment: 'node',
        },
      }),
      // React hooks: jsdom 環境で実行（renderHook が DOM を必要とするため）
      defineProject({
        plugins: [react()],
        resolve: { alias },
        test: {
          ...sharedTestConfig,
          name: 'client',
          include: ['hooks/**/*.test.ts'],
          environment: 'jsdom',
        },
      }),
    ],
  },
})
