import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { db } from '@/lib/db'
import { courses, sections, lessons, progress } from '@/lib/db/schema'
import { eq, asc, inArray } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { CourseAccordion } from '@/components/course-accordion'

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ courseId: string }>
}) {
  const { courseId } = await params
  const session = await auth.api.getSession({ headers: await headers() })
  const isAdmin = session?.user.role === 'admin'

  const course = await db.query.courses.findFirst({
    where: eq(courses.id, courseId),
  })

  if (!course || (!course.published && !isAdmin)) notFound()

  const sectionList = await db.query.sections.findMany({
    where: eq(sections.courseId, courseId),
    orderBy: [asc(sections.sortOrder), asc(sections.createdAt)],
  })

  const sectionIds = sectionList.map((s) => s.id)

  const lessonList = sectionIds.length
    ? await db.query.lessons.findMany({
        where: inArray(lessons.sectionId, sectionIds),
        orderBy: [asc(lessons.sortOrder), asc(lessons.createdAt)],
      })
    : []

  const userProgress = lessonList.length
    ? await db.query.progress.findMany({
        where: eq(progress.userId, session!.user.id),
      })
    : []

  const completedSet = new Set(userProgress.map((p) => p.lessonId))

  const sectionsWithLessons = sectionList.map((section) => ({
    ...section,
    lessons: lessonList.filter((l) => l.sectionId === section.id),
  }))

  const totalLessons = lessonList.length
  const completedCount = lessonList.filter((l) => completedSet.has(l.id)).length
  const progressPct = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      {/* 左: コース情報 */}
      <div className="lg:col-span-2">
        <div className="mb-6">
          <div className="mb-2 flex items-center gap-2">
            <Link href="/courses" className="text-sm text-blue-600 hover:underline">
              ← コース一覧
            </Link>
            {!course.published && (
              <Badge variant="secondary">非公開</Badge>
            )}
          </div>
          <h1 className="mb-2 text-2xl font-bold text-gray-900">{course.title}</h1>
          <p className="text-gray-600">{course.description}</p>
        </div>

        {/* セクション・レッスン一覧 */}
        {sectionsWithLessons.length === 0 ? (
          <div className="flex min-h-32 items-center justify-center rounded-lg border border-dashed text-gray-500">
            レッスンがまだありません
          </div>
        ) : (
          <CourseAccordion
            sections={sectionsWithLessons}
            courseId={courseId}
            initialCompleted={[...completedSet]}
          />
        )}
      </div>

      {/* 右: サイドバー */}
      <div className="space-y-4">
        {course.thumbnailUrl && (
          <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-gray-100">
            <Image src={course.thumbnailUrl} alt={course.title} fill className="object-cover" />
          </div>
        )}
        <div className="rounded-lg border bg-white p-4 shadow-sm">
          <h2 className="mb-3 font-semibold">学習進捗</h2>
          <Progress value={progressPct} className="mb-2 h-2" />
          <p className="text-sm text-gray-600">
            {completedCount} / {totalLessons} レッスン完了 ({progressPct}%)
          </p>
        </div>
      </div>
    </div>
  )
}
