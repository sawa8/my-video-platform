import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { db } from '@/lib/db'
import { courses, sections, lessons } from '@/lib/db/schema'
import { eq, asc } from 'drizzle-orm'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ courseId: string }> },
) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { courseId } = await params

  const course = await db.query.courses.findFirst({
    where: eq(courses.id, courseId),
  })

  if (!course) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  if (!course.published && session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const sectionList = await db.query.sections.findMany({
    where: eq(sections.courseId, courseId),
    orderBy: [asc(sections.sortOrder), asc(sections.createdAt)],
  })

  const lessonList = await db.query.lessons.findMany({
    where: eq(lessons.sectionId, sectionList.map((s) => s.id)[0] ?? ''),
    orderBy: [asc(lessons.sortOrder), asc(lessons.createdAt)],
  })

  // セクションごとにレッスンをグループ化
  const sectionsWithLessons = await Promise.all(
    sectionList.map(async (section) => {
      const sectionLessons = await db.query.lessons.findMany({
        where: eq(lessons.sectionId, section.id),
        orderBy: [asc(lessons.sortOrder), asc(lessons.createdAt)],
      })
      return { ...section, lessons: sectionLessons }
    }),
  )

  return NextResponse.json({ ...course, sections: sectionsWithLessons })
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ courseId: string }> },
) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { courseId } = await params
  const body = await req.json()

  const updated = await db
    .update(courses)
    .set({
      ...body,
      updatedAt: new Date(),
    })
    .where(eq(courses.id, courseId))
    .returning()

  if (!updated.length) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json(updated[0])
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ courseId: string }> },
) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { courseId } = await params

  await db.delete(courses).where(eq(courses.id, courseId))

  return NextResponse.json({ success: true })
}
