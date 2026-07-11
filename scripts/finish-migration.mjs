import { createClient } from '@libsql/client'

const c = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
})

const statements = [
  `CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    expires_at INTEGER NOT NULL,
    token TEXT NOT NULL UNIQUE,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE
  )`,

  `CREATE TABLE IF NOT EXISTS accounts (
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
]

process.stderr.write('Creating missing tables...\n')

for (const sql of statements) {
  await c.execute(sql)
  const name = sql.match(/TABLE IF NOT EXISTS (\w+)/)?.[1]
  process.stderr.write(`✅ Created: ${name}\n`)
}

// Verify
const tables = await c.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
process.stderr.write('Final tables: ' + tables.rows.map(r => r.name).join(', ') + '\n')
process.stderr.write('✅ Migration complete!\n')
process.exit(0)
