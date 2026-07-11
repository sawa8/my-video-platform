import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { db } from '@/lib/db'
import { progress } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { nanoid } from 'nanoid'

export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { lessonId, completed } = await req.json()

  if (!lessonId || typeof completed !== 'boolean') {
    return NextResponse.json({ error: 'lessonId と completed は必須です' }, { status: 400 })
  }

  const userId = session.user.id

  if (completed) {
    await db
      .insert(progress)
      .values({ id: nanoid(), userId, lessonId })
      .onConflictDoNothing()
  } else {
    await db
      .delete(progress)
      .where(and(eq(progress.userId, userId), eq(progress.lessonId, lessonId)))
  }

  return NextResponse.json({ lessonId, completed })
}

export async function GET(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const courseId = searchParams.get('courseId')

  if (!courseId) return NextResponse.json({ error: 'courseId は必須です' }, { status: 400 })

  // このユーザーのコース内全レッスンの完了状態を返す
  const completedLessons = await db.query.progress.findMany({
    where: eq(progress.userId, session.user.id),
  })

  const completedLessonIds = new Set(completedLessons.map((p) => p.lessonId))

  return NextResponse.json({ completedLessonIds: [...completedLessonIds] })
}
