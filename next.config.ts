import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  turbopack: {
    // ホームディレクトリの package-lock.json による誤検知を防ぐ
    root: __dirname,
  },
  // ネイティブバイナリを含むパッケージをTurbopackでバンドルしない
  // これにより @libsql/darwin-x64/index.node の重複ロードを防ぎ起動を高速化
  serverExternalPackages: [
    '@libsql/client',
    '@libsql/darwin-x64',
    '@libsql/core',
    '@libsql/hrana-client',
    'drizzle-orm',
    'better-auth',
    '@better-auth/core',
  ],
  images: {
    localPatterns: [
      {
        pathname: '/uploads/**',
      },
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'xsng0vduhnne5g0q.public.blob.vercel-storage.com',
      },
    ],
  },
}

export default nextConfig
