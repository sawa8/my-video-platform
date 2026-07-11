import { db } from '@/lib/db'
import { courses } from '@/lib/db/schema'
import { asc } from 'drizzle-orm'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { CoursePublishToggle } from '@/components/admin/course-publish-toggle'
import { CourseDeleteButton } from '@/components/admin/course-delete-button'

export default async function AdminCoursesPage() {
  const courseList = await db.query.courses.findMany({
    orderBy: [asc(courses.sortOrder), asc(courses.createdAt)],
  })

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">コース管理</h1>
        <Link href="/admin/courses/new">
          <Button>新しいコースを作成</Button>
        </Link>
      </div>

      {courseList.length === 0 ? (
        <div className="flex min-h-40 items-center justify-center rounded-lg border border-dashed text-gray-500">
          コースがまだありません。作成してください。
        </div>
      ) : (
        <div className="rounded-lg border bg-white shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">サムネイル</TableHead>
                <TableHead>タイトル</TableHead>
                <TableHead className="w-24">状態</TableHead>
                <TableHead className="w-48 text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {courseList.map((course) => (
                <TableRow key={course.id}>
                  <TableCell>
                    <div className="relative h-10 w-16 overflow-hidden rounded bg-gray-100">
                      {course.thumbnailUrl ? (
                        <Image
                          src={course.thumbnailUrl}
                          alt={course.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="h-full w-full bg-gray-200" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{course.title}</TableCell>
                  <TableCell>
                    <Badge variant={course.published ? 'default' : 'secondary'}>
                      {course.published ? '公開' : '非公開'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <CoursePublishToggle
                        courseId={course.id}
                        published={course.published}
                      />
                      <Link href={`/admin/courses/${course.id}`}>
                        <Button variant="outline" size="sm">
                          編集
                        </Button>
                      </Link>
                      <CourseDeleteButton courseId={course.id} courseTitle={course.title} />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
