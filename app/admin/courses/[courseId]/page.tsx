import { db } from '@/lib/db'
import { courses, sections, lessons } from '@/lib/db/schema'
import { eq, asc, inArray } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { CourseForm } from '@/components/admin/course-form'
import { CurriculumBuilder } from '@/components/admin/curriculum-builder'

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
    <div>
      <div className="mb-6 flex items-center gap-2">
        <Link href="/admin/courses" className="text-sm text-blue-600 hover:underline">
          ← コース一覧
        </Link>
      </div>

      <h1 className="mb-6 text-2xl font-bold text-gray-900">コースを編集</h1>

      <div className="mb-10 max-w-2xl">
        <h2 className="mb-4 text-lg font-semibold text-gray-700">基本情報</h2>
        <CourseForm
          courseId={course.id}
          defaultValues={{
            title: course.title,
            description: course.description,
            thumbnailUrl: course.thumbnailUrl,
          }}
        />
      </div>

      <div>
        <h2 className="mb-4 text-lg font-semibold text-gray-700">カリキュラム</h2>
        <CurriculumBuilder courseId={courseId} initialSections={sectionsWithLessons} />
      </div>
    </div>
  )
}
