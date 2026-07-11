# PROJECT_MEMO.md — 動画講座プラットフォーム

> 最終更新: 2026-06-28

---

## 概要

YouTube 埋め込み動画を使った **会員制の動画講座プラットフォーム**。
管理者がコース・セクション・レッスンを登録し、会員がログインして動画を視聴・進捗管理できる。

---

## 技術スタック


| 領域               | 技術                                    | バージョン         |
| ---------------- | ------------------------------------- | ------------- |
| フロントエンド / バックエンド | Next.js (App Router)                  | 16.x          |
| 言語               | TypeScript                            | 5.x           |
| DB               | Turso (SQLite 互換・分散)                  | -             |
| ORM              | Drizzle ORM                           | 0.45.x        |
| 認証               | NextAuth.js v5 (beta)                 | 5.0.0-beta.31 |
| UI               | Tailwind CSS v4 + shadcn/ui (Base UI) | 4.x           |
| デプロイ             | Vercel                                | -             |
| アイコン             | lucide-react                          | 1.x           |
| フォームバリデーション      | react-hook-form + zod                 | -             |


### 注意: shadcn/ui は Base UI ベース (v4)

- Radix UI とは API が異なる
- `asChild` prop は非対応 → 代わりに `render={<Button />}` を使う
- `Accordion` の `type="multiple"` は不要 → `defaultValue` に配列を渡す

---

## ディレクトリ構成

```
my-video-platform/
├── app/
│   ├── (auth)/
│   │   ├── layout.tsx
│   │   └── login/page.tsx           # ログインページ
│   ├── (main)/
│   │   ├── layout.tsx               # 認証済みユーザー向けレイアウト（ナビ付き）
│   │   └── courses/
│   │       ├── page.tsx             # コース一覧
│   │       └── [courseId]/
│   │           ├── page.tsx         # コース詳細（セクション accordion + 進捗）
│   │           └── lessons/[lessonId]/page.tsx  # レッスン視聴（YouTube embed）
│   ├── admin/
│   │   ├── layout.tsx               # 管理者専用レイアウト（role ガード）
│   │   ├── page.tsx                 # 管理ダッシュボード（統計）
│   │   └── courses/
│   │       ├── page.tsx             # コース一覧（管理者用テーブル）
│   │       ├── new/page.tsx         # コース新規作成
│   │       └── [courseId]/page.tsx  # コース編集 + カリキュラムビルダー
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts
│   │   ├── courses/route.ts             # GET（一覧）, POST（作成）
│   │   ├── courses/[courseId]/route.ts  # GET, PATCH, DELETE
│   │   ├── courses/[courseId]/sections/route.ts
│   │   ├── courses/[courseId]/sections/[sectionId]/route.ts
│   │   ├── courses/[courseId]/sections/[sectionId]/lessons/route.ts
│   │   ├── courses/[courseId]/sections/[sectionId]/lessons/[lessonId]/route.ts
│   │   ├── progress/route.ts            # GET（一覧）, POST（完了トグル）
│   │   └── upload/route.ts             # POST（サムネイル画像）
│   ├── layout.tsx                   # ルートレイアウト
│   └── page.tsx                     # / → /courses へリダイレクト
├── components/
│   ├── ui/                          # shadcn/ui 自動生成コンポーネント
│   ├── admin/
│   │   ├── course-delete-button.tsx # 削除確認ダイアログ付きボタン
│   │   ├── course-form.tsx          # コース作成・編集フォーム
│   │   ├── course-publish-toggle.tsx # 公開/非公開切り替えボタン
│   │   └── curriculum-builder.tsx   # セクション・レッスン CRUD UI
│   ├── course-accordion.tsx         # コース詳細のセクション accordion（進捗トグル付き）
│   ├── course-card.tsx              # コース一覧カード（進捗バー付き）
│   ├── lesson-complete-button.tsx   # レッスン完了ボタン（楽観的 UI）
│   ├── sign-out-button.tsx          # ログアウトボタン
│   └── youtube-embed.tsx            # YouTube 埋め込みコンポーネント
├── hooks/
│   └── use-progress.ts              # 進捗トグルの楽観的 UI hook
├── lib/
│   ├── auth.ts                      # NextAuth 設定（JWT + CredentialsProvider）
│   ├── db/
│   │   ├── index.ts                 # Turso クライアント + Drizzle インスタンス
│   │   ├── schema.ts                # 全テーブル定義
│   │   └── seed.ts                  # 初期管理者ユーザー作成スクリプト
│   └── utils.ts                     # cn(), extractYouTubeId()
├── types/
│   └── next-auth.d.ts               # Session / JWT 型拡張
├── middleware.ts                     # 全ルートの認証ガード
├── drizzle.config.ts
├── next.config.ts
├── .env.local.example               # 環境変数テンプレート
└── public/uploads/                  # コースサムネイル（MVPはローカル保存）
```

---

## DB スキーマ (`lib/db/schema.ts`)

```
users
  id            TEXT PK (nanoid)
  name          TEXT NOT NULL
  email         TEXT NOT NULL UNIQUE
  emailVerified INTEGER (timestamp)
  image         TEXT
  hashedPassword TEXT
  role          TEXT ('admin' | 'user') DEFAULT 'user'
  createdAt     INTEGER (timestamp)

accounts          ← NextAuth adapter 用
sessions          ← NextAuth adapter 用
verificationTokens ← NextAuth adapter 用

courses
  id            TEXT PK (nanoid)
  title         TEXT NOT NULL
  description   TEXT NOT NULL
  thumbnailUrl  TEXT  ← /uploads/xxx.jpg
  published     INTEGER (boolean) DEFAULT false
  sortOrder     INTEGER DEFAULT 0
  createdAt     INTEGER (timestamp)
  updatedAt     INTEGER (timestamp)

sections
  id            TEXT PK (nanoid)
  courseId      TEXT FK → courses.id (cascade)
  title         TEXT NOT NULL
  sortOrder     INTEGER DEFAULT 0
  createdAt     INTEGER (timestamp)

lessons
  id            TEXT PK (nanoid)
  sectionId     TEXT FK → sections.id (cascade)
  title         TEXT NOT NULL
  description   TEXT
  youtubeUrl    TEXT NOT NULL  ← フル URL を保存、render 時に ID 抽出
  sortOrder     INTEGER DEFAULT 0
  createdAt     INTEGER (timestamp)

progress
  id            TEXT PK (nanoid)
  userId        TEXT FK → users.id (cascade)
  lessonId      TEXT FK → lessons.id (cascade)
  completedAt   INTEGER (timestamp)
  UNIQUE(userId, lessonId)
```

---

## 認証設計

- **方式**: NextAuth.js v5 + CredentialsProvider（メール + bcrypt パスワード）
- **セッション**: JWT strategy（DB session は CredentialsProvider と非互換のため）
- **ロール**: JWT に `role` を埋め込み → `session.user.role` で参照
- **ルートガード**:
  - `middleware.ts` → `/login`, `/api/auth/`*, `/uploads/*` 以外を全てブロック
  - `app/admin/layout.tsx` → `role !== 'admin'` なら `/courses` へリダイレクト

---

## 主要な設計判断


| 項目          | 決定事項                                                    | 理由                                                         |
| ----------- | ------------------------------------------------------- | ---------------------------------------------------------- |
| YouTube URL | フル URL をそのまま DB 保存                                      | `youtu.be/xxx` / `?v=xxx` / `/embed/xxx` など複数フォーマット対応のため   |
| サムネイル       | `/public/uploads/` にローカル保存 (MVP)                        | シンプルさ優先。Vercel では ephemeral FS の制約あり → Post-MVP で R2 移行を検討 |
| 並び替え        | `sortOrder` 整数 + UP/DOWN ボタンで隣接要素 swap                  | DnD は過剰。数十件規模では整数で十分                                       |
| 進捗トグル       | `POST /api/progress { lessonId, completed }` の単一エンドポイント | 完了/取消を同一 API で upsert/delete 処理                            |
| 管理者作成       | DB seed スクリプト (`npm run db:seed`)                       | 管理者招待フローは Post-MVP                                         |


---

## 環境変数 (`.env.local`)

```env
TURSO_DATABASE_URL=libsql://your-db.turso.io
TURSO_AUTH_TOKEN=your-token

# openssl rand -base64 32 で生成
NEXTAUTH_SECRET=your-secret

# 本番は https://your-domain.vercel.app
NEXTAUTH_URL=http://localhost:3000

# seed スクリプト用（初回のみ）
SEED_ADMIN_EMAIL=admin@example.com
SEED_ADMIN_PASSWORD=changeme
SEED_ADMIN_NAME=Admin
```

---

## npm スクリプト

```bash
npm run dev          # 開発サーバー起動 (localhost:3000)
npm run build        # プロダクションビルド
npm run db:generate  # Drizzle migration ファイルを生成
npm run db:migrate   # Turso DB にマイグレーションを適用
npm run db:seed      # 初期管理者ユーザーを作成
```

---

## 初回セットアップ手順

```bash
# 1. Turso CLI インストール & ログイン
brew install tursodatabase/tap/turso
turso auth login

# 2. DB 作成 & 認証情報取得
turso db create my-video-platform
turso db show my-video-platform          # TURSO_DATABASE_URL を確認
turso db tokens create my-video-platform # TURSO_AUTH_TOKEN を取得

# 3. 環境変数設定
cp .env.local.example .env.local
# .env.local を編集して上記の値を入力

# 4. DB セットアップ
npm run db:generate
npm run db:migrate
npm run db:seed

# 5. 起動
npm run dev
```

---

## タスク進捗チェックリスト

### MVP（初回実装済み）

- [x] Phase 1: Next.js + Drizzle + Turso + NextAuth 基盤構築
- [x] Phase 2: メール/パスワード認証（会員制ログイン）
- [x] Phase 3: コース一覧ページ（進捗バー付きカード）
- [x] Phase 3: コース詳細ページ（Accordion + 完了チェック）
- [x] Phase 3: レッスン視聴ページ（YouTube embed + 完了ボタン）
- [x] Phase 4: 進捗トラッキング API + 楽観的 UI
- [x] Phase 5: 管理ダッシュボード（統計）
- [x] Phase 5: コース一覧管理（公開/非公開・削除）
- [x] Phase 5: コース作成・編集フォーム
- [x] Phase 5: サムネイルアップロード（ローカル保存）
- [x] Phase 5: カリキュラムビルダー（Section/Lesson の CRUD + UP/DOWN 並び替え）
- [x] TypeScript エラーゼロ確認
- [x] ユニットテスト実装（utils / useProgress / courses API / progress API / upload API）

### バックログ（Post-MVP）

- [ ] コメント・質問機能（各レッスン）
- [x] サムネイル外部ストレージ移行（Vercel Blob）
- [ ] 受講者の進捗を管理者が確認できる画面
- [ ] ユーザー招待・管理 UI（現在は seed のみ）
- [ ] DnD（drag-and-drop）によるカリキュラム並び替え
- [ ] コース修了証
- [ ] Vercel デプロイ設定

---

## 動作確認チェック

```
1. npm run dev → localhost:3000 → /login にリダイレクトされる
2. seed したメール/パスワードでログイン → /courses へ遷移
3. 管理者で /admin にアクセスできる
4. 一般ユーザーで /admin にアクセス → /courses へリダイレクト
5. コース作成 → セクション追加 → レッスン追加 (YouTube URL 貼付)
6. 公開にして /courses でコースが表示される
7. レッスン視聴 → 完了ボタンをクリック → progress テーブルに行が作られる
8. コース詳細の進捗バーが更新される
9. npm run build でビルドエラーなし
```

---

## ユニットテスト仕様

### テストフレームワーク

**Vitest** を使用する（Next.js との ESM 互換性が高く、設定が最小限）。

```bash
# セットアップ
npm install -D vitest @vitejs/plugin-react @testing-library/react @testing-library/jest-dom jsdom

# 実行
npm run test          # watch モード
npm run test:run      # CI 向け 1 回実行
npm run test:coverage # カバレッジ付き
```

`package.json` に追加するスクリプト:
```json
"test": "vitest",
"test:run": "vitest run",
"test:coverage": "vitest run --coverage"
```

`vitest.config.ts`:
```ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    globals: true,
  },
  resolve: {
    alias: { '@': resolve(__dirname, '.') },
  },
})
```

`vitest.setup.ts`:
```ts
import '@testing-library/jest-dom'
```

---

### テストファイル一覧と仕様

#### 1. `lib/utils.test.ts` — ユーティリティ関数

**対象**: `extractYouTubeId(url: string): string | null`

```
describe('extractYouTubeId')
  ✅ it('標準 URL から ID を抽出できる')
     入力: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
     期待: 'dQw4w9WgXcQ'

  ✅ it('短縮 URL (youtu.be) から ID を抽出できる')
     入力: 'https://youtu.be/dQw4w9WgXcQ'
     期待: 'dQw4w9WgXcQ'

  ✅ it('embed URL から ID を抽出できる')
     入力: 'https://www.youtube.com/embed/dQw4w9WgXcQ'
     期待: 'dQw4w9WgXcQ'

  ✅ it('クエリパラメータが複数あっても ID を抽出できる')
     入力: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=30&list=PLxxx'
     期待: 'dQw4w9WgXcQ'

  ✅ it('YouTube 以外の URL は null を返す')
     入力: 'https://vimeo.com/123456789'
     期待: null

  ✅ it('空文字は null を返す')
     入力: ''
     期待: null

  ✅ it('不正な形式の URL は null を返す')
     入力: 'not-a-url'
     期待: null
```

---

#### 2. `app/api/progress/route.test.ts` — 進捗トグル API

**対象**: `POST /api/progress`  
**モック**: `lib/auth`（`auth()`）、`lib/db`（`db.insert`, `db.delete`）

```
describe('POST /api/progress')

  describe('認証チェック')
    ✅ it('セッションがない場合は 401 を返す')
       auth() → null
       期待: status 401, body { error: 'Unauthorized' }

  describe('バリデーション')
    ✅ it('lessonId が未指定の場合は 400 を返す')
       body: { completed: true }（lessonId なし）
       期待: status 400

    ✅ it('completed が boolean でない場合は 400 を返す')
       body: { lessonId: 'abc', completed: 'yes' }
       期待: status 400

  describe('completed: true のとき')
    ✅ it('db.insert が呼ばれる')
       auth() → { user: { id: 'user1', role: 'user' } }
       body: { lessonId: 'lesson1', completed: true }
       期待: db.insert が 1 回呼ばれる
       期待: status 200, body { lessonId: 'lesson1', completed: true }

    ✅ it('同じレッスンを重複して完了しても onConflictDoNothing で重複しない')
       db.insert が onConflictDoNothing() を呼ぶこと（実装確認）

  describe('completed: false のとき')
    ✅ it('db.delete が呼ばれる')
       auth() → { user: { id: 'user1', role: 'user' } }
       body: { lessonId: 'lesson1', completed: false }
       期待: db.delete が 1 回呼ばれる
       期待: status 200, body { lessonId: 'lesson1', completed: false }
```

---

#### 3. `app/api/courses/route.test.ts` — コース一覧・作成 API

**対象**: `GET /api/courses`, `POST /api/courses`  
**モック**: `lib/auth`、`lib/db`

```
describe('GET /api/courses')

  ✅ it('セッションがない場合は 401 を返す')
     auth() → null
     期待: status 401

  ✅ it('一般ユーザーは published: true のコースのみ取得できる')
     auth() → { user: { role: 'user' } }
     db → [{ id: 'c1', published: true }, { id: 'c2', published: false }]
     期待: レスポンスに c1 のみ含まれる（where 条件に published: true が渡る）

  ✅ it('管理者は非公開コースも含めて全件取得できる')
     auth() → { user: { role: 'admin' } }
     期待: where 条件なし（全件取得）

describe('POST /api/courses')

  ✅ it('一般ユーザーは 403 を返す')
     auth() → { user: { role: 'user' } }
     期待: status 403

  ✅ it('セッションがない場合は 403 を返す')
     auth() → null
     期待: status 401 または 403

  ✅ it('title が未指定の場合は 400 を返す')
     auth() → { user: { role: 'admin' } }
     body: { description: '説明' }（title なし）
     期待: status 400

  ✅ it('description が未指定の場合は 400 を返す')
     auth() → { user: { role: 'admin' } }
     body: { title: 'タイトル' }（description なし）
     期待: status 400

  ✅ it('管理者は正常にコースを作成できる')
     auth() → { user: { role: 'admin' } }
     body: { title: 'テストコース', description: '説明' }
     db.insert → [{ id: 'new-id', title: 'テストコース', ... }]
     期待: status 201, body.id が存在する
```

---

#### 4. `app/api/upload/route.test.ts` — サムネイルアップロード API

**対象**: `POST /api/upload`  
**モック**: `lib/auth`、`fs/promises`（`writeFile`）

```
describe('POST /api/upload')

  ✅ it('管理者以外は 403 を返す')
     auth() → { user: { role: 'user' } }
     期待: status 403

  ✅ it('ファイルが添付されていない場合は 400 を返す')
     auth() → { user: { role: 'admin' } }
     formData にファイルなし
     期待: status 400

  ✅ it('許可されていない MIME タイプは 400 を返す')
     auth() → { user: { role: 'admin' } }
     file.type = 'image/gif'
     期待: status 400

  ✅ it('2MB を超えるファイルは 400 を返す')
     auth() → { user: { role: 'admin' } }
     file.size = 3 * 1024 * 1024
     期待: status 400

  ✅ it('正常なファイルは /uploads/ のパスを返す')
     auth() → { user: { role: 'admin' } }
     file: { type: 'image/jpeg', size: 500 * 1024, ... }
     writeFile → 成功
     期待: status 200, body.url が '/uploads/' で始まる
```

---

#### 5. `hooks/use-progress.test.ts` — 進捗 hook

**対象**: `useProgress(initialCompleted: Set<string>)`  
**モック**: `global.fetch`（`vi.fn()`）

```
describe('useProgress')

  ✅ it('initialCompleted を初期状態として持つ')
     初期: new Set(['lesson1'])
     期待: completed.has('lesson1') === true

  describe('toggle（未完了 → 完了）')
    ✅ it('fetch が POST { lessonId, completed: true } で呼ばれる')
       初期: new Set()
       toggle('lesson1') 実行
       期待: fetch('/api/progress', { method: 'POST', body: '{"lessonId":"lesson1","completed":true}' })

    ✅ it('fetch 成功前に楽観的更新で状態が変わる（同期的）')
       fetch を pending 状態に保ちながら toggle を呼ぶ
       期待: completed.has('lesson1') === true（fetch 完了前に更新済み）

    ✅ it('fetch 失敗時にロールバックされる')
       fetch → reject / res.ok = false
       初期: new Set()
       toggle('lesson1') 実行後に fetch 失敗
       期待: completed.has('lesson1') === false（元に戻る）

  describe('toggle（完了 → 未完了）')
    ✅ it('fetch が POST { lessonId, completed: false } で呼ばれる')
       初期: new Set(['lesson1'])
       toggle('lesson1') 実行
       期待: fetch('/api/progress', { method: 'POST', body: '{"lessonId":"lesson1","completed":false}' })

    ✅ it('fetch 失敗時にロールバックされる')
       fetch → res.ok = false
       初期: new Set(['lesson1'])
       toggle('lesson1') 実行後に fetch 失敗
       期待: completed.has('lesson1') === true（元に戻る）

  describe('loading 状態')
    ✅ it('toggle 中は loading が lessonId になる')
       toggle('lesson1') 実行中
       期待: loading === 'lesson1'

    ✅ it('toggle 完了後は loading が null になる')
       toggle('lesson1') 完了後
       期待: loading === null
```

---

### テスト実装の優先順位

| 優先度 | ファイル | 理由 |
|--------|---------|------|
| 高 | `lib/utils.test.ts` | 純粋関数で最も実装しやすい |
| 高 | `hooks/use-progress.test.ts` | 楽観的 UI のロールバック挙動が壊れやすい |
| 中 | `app/api/progress/route.test.ts` | 完了トグルはコア機能 |
| 中 | `app/api/courses/route.test.ts` | admin/user の権限分岐を保証する |
| 低 | `app/api/upload/route.test.ts` | バリデーション確認だけで十分 |

### モックの書き方ガイドライン

```ts
// lib/auth のモック
vi.mock('@/lib/auth', () => ({
  auth: vi.fn(),
}))

// lib/db のモック
vi.mock('@/lib/db', () => ({
  db: {
    query: { courses: { findMany: vi.fn() } },
    insert: vi.fn(() => ({ values: vi.fn(() => ({ returning: vi.fn() })) })),
    delete: vi.fn(() => ({ where: vi.fn() })),
  },
}))

// fetch のモック（hooks テスト用）
global.fetch = vi.fn()
```

### テスト禁止事項（CLAUDE.md 準拠）

- テストを通すためにテストコード（`it` / `expect`）を変更してはならない
- テストが失敗した場合は **実装コードを修正** して通す
- `describe` / `it` のブロック内容・期待値を変更する場合は必ずユーザーに確認する

