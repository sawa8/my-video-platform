## 2026-07-05

- [完了] Turso データベース作成・スキーマ適用・管理者シード
- [完了] 受講者向け新規登録機能実装（`/register` ページ + `POST /api/register`）
- [完了] Google OAuth 認証追加（`lib/auth.ts` に Google プロバイダー追加）
- [完了] Google OAuth の `AdapterError: SQLITE_UNKNOWN` 修正
  - 原因：`DrizzleAdapter(db)` がデフォルトで単数形テーブル名（`"account"`, `"user"`）を参照していたが、スキーマは複数形（`"accounts"`, `"users"`）
  - 修正：`DrizzleAdapter(db, { usersTable, accountsTable, sessionsTable, verificationTokensTable })` で明示的にテーブルを渡す

## 2026-07-02

- [完了] ユニットテスト全 34 件パス（5 ファイル）
  - `lib/utils.test.ts` — extractYouTubeId（7 テスト）
  - `hooks/use-progress.test.ts` — useProgress 楽観的更新（8 テスト）
  - `app/api/progress/route.test.ts` — POST /api/progress（6 テスト）
  - `app/api/courses/route.test.ts` — GET・POST /api/courses（7 テスト）
  - `app/api/upload/route.test.ts` — POST /api/upload（5 テスト、ファイル/MIME/サイズ検証含む）
- [完了] vitest.config.ts を `test.projects` 構成に移行
  - API ルート/ユーティリティ → `node` 環境（jsdom の File/FormData 互換問題を回避）
  - React hooks → `jsdom` 環境（renderHook が DOM を必要とするため）
  - `pool: 'threads'` でパス内スペースによるタイムアウト問題を回避
  - vitest 4 では `test.workspace` が廃止、`test.projects` + `defineProject` を使用

## 2026-07-11

- [完了] `npm run dev` が起動しない・応答しない問題を根本解決
  - 原因1: Node.js が x86_64 バイナリ（Volta/nodebrew とも）で Rosetta エミュレーション動作 → ARM64 Homebrew の node@22 を導入
  - 原因2: プロジェクトが `~/Desktop`（iCloud 同期対象）にあり、「Macストレージを最適化」で node_modules が dataless プレースホルダー化 → 読み込みが1ファイル約1秒（通常の約4000倍遅）
  - 原因3: ディスク空き 7.2GB・スワップ 9.8GB 使用のスラッシング状態 → Downloads 整理・再起動で解消
  - 対処: プロジェクトを `~/dev/DMM_AI_CAMP/Claude Code/my-video-platform` に移動（iCloud 同期対象外）、ARM64 npm で依存関係再インストール
  - 注意: Turbopack の PostCSS ワーカーは PATH から node を探すため、`PATH="/opt/homebrew/opt/node@22/bin:$PATH"` を先頭に付けて起動する必要あり（Volta の x86 node を回避）
- [完了] `proxy.ts` を軽量化 — DB を使う `auth.api.getSession()` からクッキー存在チェック（`better-auth.session_token`）に変更。完全なセッション検証はレイアウト/ページ側で実施
- [完了] `next.config.ts` に `serverExternalPackages`（@libsql/client, drizzle-orm, better-auth 等）を追加
- [完了] 起動確認: Ready in 385ms / `/login` 200 / `/` → `/login` リダイレクト / `/api/auth/get-session` 200
- [追加] 一般ページ・管理画面のレイアウトでセッション完全検証が行われているか確認（proxy 軽量化に伴うフォロー）
- [追加] `.zshrc` に ARM64 node の PATH 追加（恒久対応、ユーザー作業）
