import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { db } from '@/lib/db'
import { courses, lessons, sections, progress } from '@/lib/db/schema'
import { eq, asc, inArray } from 'drizzle-orm'
import { CourseCard } from '@/components/course-card'

export default async function CoursesPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  const isAdmin = session?.user.role === 'admin'

  const courseList = await db.query.courses.findMany({
    where: isAdmin ? undefined : eq(courses.published, true),
    orderBy: [asc(courses.sortOrder), asc(courses.createdAt)],
  })

  // 全コースのレッスン数と完了数を取得
  const courseIds = courseList.map((c) => c.id)

  const allSections = courseIds.length
    ? await db.query.sections.findMany({
        where: inArray(sections.courseId, courseIds),
      })
    : []

  const sectionIds = allSections.map((s) => s.id)

  const allLessons = sectionIds.length
    ? await db.query.lessons.findMany({
        where: inArray(lessons.sectionId, sectionIds),
      })
    : []

  const userId = session!.user.id
  const userProgress = allLessons.length
    ? await db.query.progress.findMany({
        where: eq(progress.userId, userId),
      })
    : []

  const completedSet = new Set(userProgress.map((p) => p.lessonId))

  // コースごとのレッスン数と完了数をマップ
  const courseStats = courseList.map((course) => {
    const courseSectionIds = allSections
      .filter((s) => s.courseId === course.id)
      .map((s) => s.id)
    const courseLessons = allLessons.filter((l) => courseSectionIds.includes(l.sectionId))
    const completed = courseLessons.filter((l) => completedSet.has(l.id)).length
    return {
      ...course,
      totalLessons: courseLessons.length,
      completedCount: completed,
    }
  })

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">コース一覧</h1>
      {courseStats.length === 0 ? (
        <div className="flex min-h-40 items-center justify-center rounded-lg border border-dashed text-gray-500">
          コースがまだありません
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {courseStats.map((course) => (
            <CourseCard
              key={course.id}
              id={course.id}
              title={course.title}
              description={course.description}
              thumbnailUrl={course.thumbnailUrl}
              published={course.published}
              completedCount={course.completedCount}
              totalLessons={course.totalLessons}
            />
          ))}
        </div>
      )}
    </div>
  )
}
