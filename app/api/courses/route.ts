import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { db } from '@/lib/db'
import { courses } from '@/lib/db/schema'
import { eq, asc } from 'drizzle-orm'
import { nanoid } from 'nanoid'

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const isAdmin = session.user.role === 'admin'

  const list = await db.query.courses.findMany({
    where: isAdmin ? undefined : eq(courses.published, true),
    orderBy: [asc(courses.sortOrder), asc(courses.createdAt)],
  })

  return NextResponse.json(list)
}

export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json()
  const { title, description, thumbnailUrl } = body

  if (!title || !description) {
    return NextResponse.json({ error: 'title と description は必須です' }, { status: 400 })
  }

  const course = await db
    .insert(courses)
    .values({
      id: nanoid(),
      title,
      description,
      thumbnailUrl: thumbnailUrl ?? null,
    })
    .returning()

  return NextResponse.json(course[0], { status: 201 })
}
