import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { db } from '@/lib/db'
import { sections } from '@/lib/db/schema'
import { eq, asc } from 'drizzle-orm'
import { nanoid } from 'nanoid'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ courseId: string }> },
) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { courseId } = await params

  const list = await db.query.sections.findMany({
    where: eq(sections.courseId, courseId),
    orderBy: [asc(sections.sortOrder), asc(sections.createdAt)],
  })

  return NextResponse.json(list)
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ courseId: string }> },
) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { courseId } = await params
  const { title, sortOrder } = await req.json()

  if (!title) return NextResponse.json({ error: 'title は必須です' }, { status: 400 })

  const section = await db
    .insert(sections)
    .values({
      id: nanoid(),
      courseId,
      title,
      sortOrder: sortOrder ?? 0,
    })
    .returning()

  return NextResponse.json(section[0], { status: 201 })
}
