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
import { Plus, BookOpen, Pencil } from 'lucide-react'

export default async function AdminCoursesPage() {
  const courseList = await db.query.courses.findMany({
    orderBy: [asc(courses.sortOrder), asc(courses.createdAt)],
  })

  return (
    <div className="animate-fade-in-up">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">コース管理</h1>
          <p className="text-sm text-muted-foreground mt-1">{courseList.length} 件のコース</p>
        </div>
        <Link href="/admin/courses/new">
          <Button className="gap-2 shadow-sm">
            <Plus className="h-4 w-4" />
            新しいコースを作成
          </Button>
        </Link>
      </div>

      {courseList.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border/60 py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted mb-4">
            <BookOpen className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground font-medium">コースがまだありません</p>
          <p className="text-sm text-muted-foreground/60 mt-1">最初のコースを作成してください</p>
          <Link href="/admin/courses/new" className="mt-4">
            <Button variant="outline" size="sm" className="gap-1.5">
              <Plus className="h-3.5 w-3.5" />
              コースを作成
            </Button>
          </Link>
        </div>
      ) : (
        <div className="rounded-xl border border-border/50 bg-card shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-20">サムネイル</TableHead>
                <TableHead>タイトル</TableHead>
                <TableHead className="w-24">状態</TableHead>
                <TableHead className="w-56 text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {courseList.map((course) => (
                <TableRow key={course.id} className="hover:bg-muted/30">
                  <TableCell>
                    <div className="relative h-11 w-18 overflow-hidden rounded-lg bg-muted">
                      {course.thumbnailUrl ? (
                        <Image
                          src={course.thumbnailUrl}
                          alt={course.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <BookOpen className="h-4 w-4 text-muted-foreground/40" />
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium text-foreground">{course.title}</span>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={course.published ? 'default' : 'secondary'}
                      className={course.published ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-50' : ''}
                    >
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
                        <Button variant="outline" size="sm" className="gap-1.5">
                          <Pencil className="h-3 w-3" />
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
