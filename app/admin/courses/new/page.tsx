import { CourseForm } from '@/components/admin/course-form'

export default function NewCoursePage() {
  return (
    <div className="max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">新しいコースを作成</h1>
      <CourseForm />
    </div>
  )
}
