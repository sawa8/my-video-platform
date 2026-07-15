import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { db } from '@/lib/db'
import { courses, lessons, sections, progress } from '@/lib/db/schema'
import { eq, asc, inArray } from 'drizzle-orm'
import { CourseCard } from '@/components/course-card'
import { BookOpen } from 'lucide-react'

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

  const totalCompleted = userProgress.length
  const totalLessonsAll = allLessons.length

  return (
    <div className="animate-fade-in-up">
      {/* ヒーローセクション */}
      <div className="hero-gradient rounded-2xl p-8 sm:p-10 mb-8 text-white">
        <div className="max-w-2xl">
          <p className="text-sm font-medium text-white/70 mb-2">
            {session!.user.name} さん、おかえりなさい
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3">
            学習を続けましょう
          </h1>
          {totalLessonsAll > 0 && (
            <div className="flex items-center gap-4 mt-5">
              <div className="flex items-center gap-2 text-sm">
                <div className="h-2 w-2 rounded-full bg-emerald-400" />
                <span className="text-white/80">
                  {totalCompleted} / {totalLessonsAll} レッスン完了
                </span>
              </div>
              <div className="flex-1 max-w-xs h-1.5 bg-white/15 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-300 transition-all duration-500"
                  style={{ width: `${totalLessonsAll > 0 ? Math.round((totalCompleted / totalLessonsAll) * 100) : 0}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* コース一覧 */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-foreground">コース一覧</h2>
        <span className="text-sm text-muted-foreground">{courseStats.length} コース</span>
      </div>

      {courseStats.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border/60 py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted mb-4">
            <BookOpen className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground font-medium">コースがまだありません</p>
          <p className="text-sm text-muted-foreground/60 mt-1">管理者がコースを作成すると、ここに表示されます</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {courseStats.map((course, i) => (
            <div key={course.id} className="animate-fade-in-up" style={{ animationDelay: `${i * 80}ms` }}>
              <CourseCard
                id={course.id}
                title={course.title}
                description={course.description}
                thumbnailUrl={course.thumbnailUrl}
                published={course.published}
                completedCount={course.completedCount}
                totalLessons={course.totalLessons}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
