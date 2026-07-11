import { db } from '@/lib/db'
import { courses, users } from '@/lib/db/schema'
import { count, eq } from 'drizzle-orm'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default async function AdminDashboard() {
  const [totalCourses] = await db.select({ count: count() }).from(courses)
  const [publishedCourses] = await db
    .select({ count: count() })
    .from(courses)
    .where(eq(courses.published, true))
  const [totalUsers] = await db.select({ count: count() }).from(users)

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">ダッシュボード</h1>
        <Link href="/admin/courses/new">
          <Button>新しいコースを作成</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">総コース数</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totalCourses.count}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">公開コース</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{publishedCourses.count}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">登録ユーザー</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totalUsers.count}</p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <Link href="/admin/courses" className="text-blue-600 hover:underline text-sm">
          → コース一覧を管理する
        </Link>
      </div>
    </div>
  )
}
