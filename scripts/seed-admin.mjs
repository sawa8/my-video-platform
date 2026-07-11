import { createClient } from '@libsql/client'
import { randomBytes } from 'crypto'

process.stderr.write('Starting seed...\n')

const c = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
})

const email = process.env.SEED_ADMIN_EMAIL ?? 'admin@example.com'
const password = process.env.SEED_ADMIN_PASSWORD ?? 'changeme'
const name = process.env.SEED_ADMIN_NAME ?? 'Admin'

const nanoid = () => randomBytes(10).toString('base64url').slice(0, 16)
const now = Math.floor(Date.now() / 1000)

process.stderr.write(`Target: ${email}\n`)

// Check if user exists
const existing = await c.execute({
  sql: 'SELECT id FROM users WHERE email = ?',
  args: [email],
})

process.stderr.write(`Existing rows: ${existing.rows.length}\n`)

// Use better-auth's password hash format
// better-auth internally uses bcrypt with cost 10
// We'll hash the password using the bcryptjs module
const { default: bcrypt } = await import('bcryptjs')

process.stderr.write('bcrypt loaded\n')

let userId

if (existing.rows.length === 0) {
  userId = nanoid()
  const hashedPassword = await bcrypt.hash(password, 10)

  process.stderr.write(`Creating user with id: ${userId}\n`)

  await c.execute({
    sql: `INSERT INTO users (id, name, email, email_verified, role, created_at, updated_at)
          VALUES (?, ?, ?, 0, 'admin', ?, ?)`,
    args: [userId, name, email, now, now],
  })

  await c.execute({
    sql: `INSERT INTO accounts (id, account_id, provider_id, user_id, password, created_at, updated_at)
          VALUES (?, ?, 'credential', ?, ?, ?, ?)`,
    args: [nanoid(), userId, userId, hashedPassword, now, now],
  })

  process.stderr.write(`✅ Admin user created: ${email}\n`)
} else {
  userId = String(existing.rows[0].id)
  process.stderr.write(`User exists with id: ${userId}\n`)

  await c.execute({
    sql: "UPDATE users SET role = 'admin', updated_at = ? WHERE email = ?",
    args: [now, email],
  })

  const acct = await c.execute({
    sql: "SELECT id FROM accounts WHERE user_id = ? AND provider_id = 'credential'",
    args: [userId],
  })

  if (acct.rows.length === 0) {
    const hashedPassword = await bcrypt.hash(password, 10)
    await c.execute({
      sql: `INSERT INTO accounts (id, account_id, provider_id, user_id, password, created_at, updated_at)
            VALUES (?, ?, 'credential', ?, ?, ?, ?)`,
      args: [nanoid(), userId, userId, hashedPassword, now, now],
    })
    process.stderr.write(`✅ Credential account added: ${email}\n`)
  } else {
    process.stderr.write(`✅ Admin user already seeded: ${email}\n`)
  }
}

process.exit(0)
