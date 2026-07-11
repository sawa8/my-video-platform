import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { db } from '@/lib/db'
import { lessons } from '@/lib/db/schema'
import { eq, asc } from 'drizzle-orm'
import { nanoid } from 'nanoid'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ sectionId: string }> },
) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { sectionId } = await params

  const list = await db.query.lessons.findMany({
    where: eq(lessons.sectionId, sectionId),
    orderBy: [asc(lessons.sortOrder), asc(lessons.createdAt)],
  })

  return NextResponse.json(list)
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ sectionId: string }> },
) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { sectionId } = await params
  const { title, description, youtubeUrl, sortOrder } = await req.json()

  if (!title || !youtubeUrl) {
    return NextResponse.json({ error: 'title と youtubeUrl は必須です' }, { status: 400 })
  }

  const lesson = await db
    .insert(lessons)
    .values({
      id: nanoid(),
      sectionId,
      title,
      description: description ?? null,
      youtubeUrl,
      sortOrder: sortOrder ?? 0,
    })
    .returning()

  return NextResponse.json(lesson[0], { status: 201 })
}
