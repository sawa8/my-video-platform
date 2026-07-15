import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { db } from '@/lib/db'
import { courses, sections, lessons, progress } from '@/lib/db/schema'
import { eq, asc, inArray } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import { CourseAccordion } from '@/components/course-accordion'
import { ArrowLeft, BookOpen, Clock, Layers } from 'lucide-react'

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
    <div className="animate-fade-in-up">
      {/* ヒーローバナー */}
      <div className="relative hero-gradient rounded-2xl overflow-hidden mb-8">
        {course.thumbnailUrl && (
          <div className="absolute inset-0">
            <Image
              src={course.thumbnailUrl}
              alt=""
              fill
              className="object-cover opacity-15 blur-sm"
            />
          </div>
        )}
        <div className="relative p-8 sm:p-10">
          <Link
            href="/courses"
            className="inline-flex items-center gap-1.5 text-sm text-white/60 hover:text-white/90 transition-colors mb-5"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            コース一覧
          </Link>
          <div className="flex flex-wrap items-center gap-2 mb-3">
            {!course.published && (
              <Badge variant="secondary" className="bg-white/15 text-white border-0 text-xs">
                非公開
              </Badge>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-3">
            {course.title}
          </h1>
          <p className="text-white/70 max-w-2xl leading-relaxed">{course.description}</p>
          <div className="flex items-center gap-5 mt-6">
            <div className="flex items-center gap-1.5 text-sm text-white/60">
              <Layers className="h-4 w-4" />
              {sectionList.length} セクション
            </div>
            <div className="flex items-center gap-1.5 text-sm text-white/60">
              <BookOpen className="h-4 w-4" />
              {totalLessons} レッスン
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* 左: カリキュラム */}
        <div className="lg:col-span-2">
          <h2 className="text-lg font-bold text-foreground mb-4">カリキュラム</h2>
          {sectionsWithLessons.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border/60 py-12 text-center">
              <BookOpen className="h-8 w-8 text-muted-foreground/40 mb-3" />
              <p className="text-muted-foreground">レッスンがまだありません</p>
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
        <div className="space-y-5">
          {course.thumbnailUrl && (
            <div className="relative aspect-video w-full overflow-hidden rounded-xl shadow-sm">
              <Image src={course.thumbnailUrl} alt={course.title} fill className="object-cover" />
            </div>
          )}
          <div className="rounded-xl border border-border/50 bg-card p-5 shadow-sm">
            <h3 className="font-semibold text-foreground mb-4">学習進捗</h3>
            {/* 円形プログレス */}
            <div className="flex items-center gap-5 mb-4">
              <div className="relative h-20 w-20 shrink-0">
                <svg className="h-20 w-20 -rotate-90" viewBox="0 0 80 80">
                  <circle
                    cx="40" cy="40" r="34"
                    fill="none"
                    stroke="oklch(0.91 0.006 75)"
                    strokeWidth="6"
                  />
                  <circle
                    cx="40" cy="40" r="34"
                    fill="none"
                    stroke="oklch(0.42 0.10 195)"
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 34}`}
                    strokeDashoffset={`${2 * Math.PI * 34 * (1 - progressPct / 100)}`}
                    className="transition-all duration-700"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-bold text-foreground">{progressPct}%</span>
                </div>
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{completedCount}<span className="text-base font-normal text-muted-foreground"> / {totalLessons}</span></p>
                <p className="text-sm text-muted-foreground">レッスン完了</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
