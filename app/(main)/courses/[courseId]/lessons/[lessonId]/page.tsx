import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { db } from '@/lib/db'
import { lessons, sections, courses, progress } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { YouTubeEmbed } from '@/components/youtube-embed'
import { LessonCompleteButton } from '@/components/lesson-complete-button'
import { ArrowLeft, ChevronRight } from 'lucide-react'

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
    <div className="animate-fade-in-up max-w-5xl mx-auto">
      {/* パンくずリスト */}
      <nav className="mb-5 flex items-center gap-1.5 text-sm text-muted-foreground overflow-x-auto">
        <Link href="/courses" className="shrink-0 hover:text-foreground transition-colors">
          コース一覧
        </Link>
        <ChevronRight className="h-3.5 w-3.5 shrink-0 text-border" />
        <Link href={`/courses/${courseId}`} className="shrink-0 hover:text-foreground transition-colors truncate max-w-[200px]">
          {course.title}
        </Link>
        {section && (
          <>
            <ChevronRight className="h-3.5 w-3.5 shrink-0 text-border" />
            <span className="truncate text-foreground/70">{section.title}</span>
          </>
        )}
      </nav>

      <h1 className="text-2xl font-bold text-foreground tracking-tight mb-6">{lesson.title}</h1>

      {/* ビデオプレーヤー */}
      <div className="rounded-2xl overflow-hidden shadow-lg mb-8 bg-black/5">
        <YouTubeEmbed url={lesson.youtubeUrl} title={lesson.title} />
      </div>

      {lesson.description && (
        <div className="mb-8 rounded-xl border border-border/50 bg-card p-6 shadow-sm">
          <h2 className="text-base font-semibold text-foreground mb-3">レッスン概要</h2>
          <p className="whitespace-pre-wrap text-muted-foreground leading-relaxed">{lesson.description}</p>
        </div>
      )}

      <div className="flex items-center justify-between pt-2 pb-4">
        <Link
          href={`/courses/${courseId}`}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          コース詳細に戻る
        </Link>
        <LessonCompleteButton lessonId={lessonId} initialCompleted={isCompleted} />
      </div>
    </div>
  )
}
