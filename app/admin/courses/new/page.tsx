import { CourseForm } from '@/components/admin/course-form'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function NewCoursePage() {
  return (
    <div className="max-w-2xl animate-fade-in-up">
      <Link
        href="/admin/courses"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-5"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        コース一覧
      </Link>
      <h1 className="mb-6 text-2xl font-bold text-foreground tracking-tight">新しいコースを作成</h1>
      <CourseForm />
    </div>
  )
}
