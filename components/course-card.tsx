import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'

interface CourseCardProps {
  id: string
  title: string
  description: string
  thumbnailUrl: string | null
  published: boolean
  completedCount?: number
  totalLessons?: number
}

export function CourseCard({
  id,
  title,
  description,
  thumbnailUrl,
  published,
  completedCount = 0,
  totalLessons = 0,
}: CourseCardProps) {
  const progressPct = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0

  return (
    <Link href={`/courses/${id}`}>
      <Card className="h-full overflow-hidden transition-shadow hover:shadow-md">
        <div className="relative aspect-video w-full bg-gray-100">
          {thumbnailUrl ? (
            <Image src={thumbnailUrl} alt={title} fill className="object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-gray-400 text-sm">
              サムネイルなし
            </div>
          )}
          {!published && (
            <Badge variant="secondary" className="absolute top-2 left-2">
              非公開
            </Badge>
          )}
        </div>
        <CardHeader className="pb-2">
          <CardTitle className="line-clamp-2 text-base">{title}</CardTitle>
          <CardDescription className="line-clamp-2 text-sm">{description}</CardDescription>
        </CardHeader>
        {totalLessons > 0 && (
          <CardContent className="pt-0">
            <div className="space-y-1">
              <Progress value={progressPct} className="h-1.5" />
              <p className="text-xs text-gray-500">
                {completedCount} / {totalLessons} レッスン完了
              </p>
            </div>
          </CardContent>
        )}
      </Card>
    </Link>
  )
}
