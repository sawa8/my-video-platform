import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { db } from '@/lib/db'
import { lessons } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ lessonId: string }> },
) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { lessonId } = await params

  const lesson = await db.query.lessons.findFirst({
    where: eq(lessons.id, lessonId),
  })

  if (!lesson) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json(lesson)
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ lessonId: string }> },
) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { lessonId } = await params
  const body = await req.json()

  const updated = await db
    .update(lessons)
    .set(body)
    .where(eq(lessons.id, lessonId))
    .returning()

  if (!updated.length) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json(updated[0])
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ lessonId: string }> },
) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { lessonId } = await params

  await db.delete(lessons).where(eq(lessons.id, lessonId))

  return NextResponse.json({ success: true })
}
