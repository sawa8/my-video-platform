import { db } from '@/lib/db'
import { courses, users } from '@/lib/db/schema'
import { count, eq } from 'drizzle-orm'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Plus, BookOpen, Eye, Users } from 'lucide-react'

export default async function AdminDashboard() {
  const [totalCourses] = await db.select({ count: count() }).from(courses)
  const [publishedCourses] = await db
    .select({ count: count() })
    .from(courses)
    .where(eq(courses.published, true))
  const [totalUsers] = await db.select({ count: count() }).from(users)

  const stats = [
    {
      label: '総コース数',
      value: totalCourses.count,
      icon: BookOpen,
      color: 'text-primary',
      bg: 'bg-primary/10',
    },
    {
      label: '公開コース',
      value: publishedCourses.count,
      icon: Eye,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      label: '登録ユーザー',
      value: totalUsers.count,
      icon: Users,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
  ]

  return (
    <div className="animate-fade-in-up">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">ダッシュボード</h1>
          <p className="text-sm text-muted-foreground mt-1">コースと受講者の概要</p>
        </div>
        <Link href="/admin/courses/new">
          <Button className="gap-2 shadow-sm">
            <Plus className="h-4 w-4" />
            新しいコースを作成
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 mb-8">
        {stats.map((stat) => (
          <Card key={stat.label} className="border-border/50 shadow-sm">
            <CardContent className="flex items-center gap-4 p-5">
              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${stat.bg}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-3xl font-bold text-foreground tracking-tight">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-border/50 shadow-sm">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-foreground">コース管理</h2>
              <p className="text-sm text-muted-foreground mt-0.5">コースの作成・編集・公開設定を管理します</p>
            </div>
            <Link href="/admin/courses">
              <Button variant="outline" size="sm" className="gap-1.5">
                管理画面へ
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
