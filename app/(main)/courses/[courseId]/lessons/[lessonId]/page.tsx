import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { db } from '@/lib/db'
import { lessons, sections, courses, progress } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { YouTubeEmbed } from '@/components/youtube-embed'
import { LessonCompleteButton } from '@/components/lesson-complete-button'

export default async function LessonPage({
  params,
}: {
  params: Promise<{ courseId: string; lessonId: string }>
}) {
  const { courseId, lessonId } = await params
  const session = await auth.api.getSession({ headers: await headers() })

  const lesson = await db.query.lessons.findFirst({
    where: eq(lessons.id, lessonId),
  })

  if (!lesson) notFound()

  const section = await db.query.sections.findFirst({
    where: eq(sections.id, lesson.sectionId),
  })

  const course = await db.query.courses.findFirst({
    where: eq(courses.id, courseId),
  })

  if (!course || (!course.published && session?.user.role !== 'admin')) notFound()

  const userProgress = await db.query.progress.findFirst({
    where: eq(progress.lessonId, lessonId),
  })

  const isCompleted = !!userProgress

  return (
    <div className="max-w-4xl">
      <div className="mb-4 flex items-center gap-2 text-sm text-gray-500">
        <Link href="/courses" className="hover:text-blue-600 hover:underline">
          コース一覧
        </Link>
        <span>/</span>
        <Link href={`/courses/${courseId}`} className="hover:text-blue-600 hover:underline">
          {course.title}
        </Link>
        {section && (
          <>
            <span>/</span>
            <span>{section.title}</span>
          </>
        )}
      </div>

      <h1 className="mb-6 text-2xl font-bold text-gray-900">{lesson.title}</h1>

      <div className="mb-6">
        <YouTubeEmbed url={lesson.youtubeUrl} title={lesson.title} />
      </div>

      {lesson.description && (
        <div className="mb-6 rounded-lg border bg-white p-4 shadow-sm">
          <h2 className="mb-2 font-semibold">説明</h2>
          <p className="whitespace-pre-wrap text-gray-700">{lesson.description}</p>
        </div>
      )}

      <div className="flex items-center justify-between">
        <Link
          href={`/courses/${courseId}`}
          className="text-sm text-blue-600 hover:underline"
        >
          ← コース詳細に戻る
        </Link>
        <LessonCompleteButton lessonId={lessonId} initialCompleted={isCompleted} />
      </div>
    </div>
  )
}
