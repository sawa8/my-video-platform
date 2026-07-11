import { createClient } from '@libsql/client'

process.stderr.write('Starting check...\n')

const timeout = setTimeout(() => {
  process.stderr.write('TIMEOUT - DB connection took too long\n')
  process.exit(1)
}, 15000)

try {
  const c = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
  })

  process.stderr.write('Client created, querying...\n')
  const tables = await c.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
  clearTimeout(timeout)
  process.stderr.write('Tables: ' + tables.rows.map(r => r.name).join(', ') + '\n')

  for (const row of tables.rows) {
    const info = await c.execute(`PRAGMA table_info(${row.name})`)
    process.stderr.write(`[${row.name}]: ${info.rows.map(r => r.name).join(', ')}\n`)
  }
} catch (e) {
  clearTimeout(timeout)
  process.stderr.write('ERROR: ' + e.message + '\n')
}
process.exit(0)
