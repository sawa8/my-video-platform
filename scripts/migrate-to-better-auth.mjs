import { createClient } from '@libsql/client'

const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
})

const statements = [
  'PRAGMA foreign_keys=OFF',

  // Drop old NextAuth tables
  'DROP TABLE IF EXISTS verification_tokens',
  'DROP TABLE IF EXISTS sessions',
  'DROP TABLE IF EXISTS accounts',

  // Delete existing users (they'll be re-seeded via BetterAuth)
  'DELETE FROM progress',
  'DELETE FROM users',

  // Update users table structure
  'ALTER TABLE users ADD COLUMN updated_at INTEGER',  // nullable first
  'ALTER TABLE users DROP COLUMN hashed_password',
  'UPDATE users SET email_verified = 0 WHERE email_verified IS NULL',

  // Create new BetterAuth sessions table
  `CREATE TABLE sessions (
    id TEXT PRIMARY KEY,
    expires_at INTEGER NOT NULL,
    token TEXT NOT NULL UNIQUE,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE
  )`,

  // Create new BetterAuth accounts table
  `CREATE TABLE accounts (
    id TEXT PRIMARY KEY,
    account_id TEXT NOT NULL,
    provider_id TEXT NOT NULL,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    access_token TEXT,
    refresh_token TEXT,
    id_token TEXT,
    access_token_expires_at INTEGER,
    refresh_token_expires_at INTEGER,
    scope TEXT,
    password TEXT,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  )`,

  // Create verifications table
  `CREATE TABLE verifications (
    id TEXT PRIMARY KEY,
    identifier TEXT NOT NULL,
    value TEXT NOT NULL,
    expires_at INTEGER NOT NULL,
    created_at INTEGER,
    updated_at INTEGER
  )`,

  'PRAGMA foreign_keys=ON',
]

console.log('🔄 Applying BetterAuth migration...')

for (const sql of statements) {
  try {
    await client.execute(sql)
    console.log(`✅ ${sql.slice(0, 60).replace(/\n/g, ' ')}...`)
  } catch (err) {
    console.error(`❌ Failed: ${sql.slice(0, 60)}`)
    console.error(err.message)
    process.exit(1)
  }
}

console.log('✅ Migration complete!')
process.exit(0)
