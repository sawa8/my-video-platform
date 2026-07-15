import { db } from '@/lib/db'
import { courses, sections, lessons } from '@/lib/db/schema'
import { eq, asc, inArray } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { CourseForm } from '@/components/admin/course-form'
import { CurriculumBuilder } from '@/components/admin/curriculum-builder'
import { ArrowLeft } from 'lucide-react'

export default async function AdminCourseEditPage({
  params,
}: {
  params: Promise<{ courseId: string }>
}) {
  const { courseId } = await params

  const course = await db.query.courses.findFirst({
    where: eq(courses.id, courseId),
  })

  if (!course) notFound()

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

  const sectionsWithLessons = sectionList.map((section) => ({
    ...section,
    lessons: lessonList.filter((l) => l.sectionId === section.id),
  }))

  return (
    <div className="animate-fade-in-up">
      <Link
        href="/admin/courses"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-5"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        コース一覧
      </Link>

      <h1 className="mb-8 text-2xl font-bold text-foreground tracking-tight">コースを編集</h1>

      <div className="mb-12 max-w-2xl">
        <h2 className="mb-4 text-lg font-semibold text-foreground">基本情報</h2>
        <div className="rounded-xl border border-border/50 bg-card p-6 shadow-sm">
          <CourseForm
            courseId={course.id}
            defaultValues={{
              title: course.title,
              description: course.description,
              thumbnailUrl: course.thumbnailUrl,
            }}
          />
        </div>
      </div>

      <div>
        <h2 className="mb-4 text-lg font-semibold text-foreground">カリキュラム</h2>
        <CurriculumBuilder courseId={courseId} initialSections={sectionsWithLessons} />
      </div>
    </div>
  )
}
