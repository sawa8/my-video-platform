import { db } from './index'
import { users, accounts } from './schema'
import bcrypt from 'bcryptjs'
import { nanoid } from 'nanoid'
import { eq } from 'drizzle-orm'

async function seed() {
  const email = process.env.SEED_ADMIN_EMAIL ?? 'admin@example.com'
  const password = process.env.SEED_ADMIN_PASSWORD ?? 'changeme'
  const name = process.env.SEED_ADMIN_NAME ?? 'Admin'

  // Check if already exists
  const existing = await db.query.users.findFirst({ where: eq(users.email, email) })

  if (!existing) {
    const userId = nanoid()
    const now = new Date()
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    await db.insert(users).values({
      id: userId,
      name,
      email,
      emailVerified: false,
      role: 'admin',
      createdAt: now,
      updatedAt: now,
    })

    // Create credential account (BetterAuth stores passwords here)
    await db.insert(accounts).values({
      id: nanoid(),
      accountId: userId,
      providerId: 'credential',
      userId,
      password: hashedPassword,
      createdAt: now,
      updatedAt: now,
    })

    console.log(`✅ Admin user created: ${email}`)
  } else {
    // Ensure admin role and credential account exists
    await db.update(users)
      .set({ role: 'admin', updatedAt: new Date() })
      .where(eq(users.email, email))

    // Add credential account if missing
    const credAccount = await db.query.accounts.findFirst({
      where: eq(accounts.userId, existing.id),
    })
    if (!credAccount) {
      const hashedPassword = await bcrypt.hash(password, 10)
      await db.insert(accounts).values({
        id: nanoid(),
        accountId: existing.id,
        providerId: 'credential',
        userId: existing.id,
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    }

    console.log(`✅ Admin user already exists, role confirmed: ${email}`)
  }

  process.exit(0)
}

seed().catch((err) => {
  console.error(err)
  process.exit(1)
})
