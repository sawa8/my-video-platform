import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BookOpen, CheckCircle2 } from 'lucide-react'

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
  const isComplete = totalLessons > 0 && completedCount === totalLessons

  return (
    <Link href={`/courses/${id}`}>
      <Card className="group h-full overflow-hidden card-hover border-border/50 bg-card">
        <div className="relative aspect-video w-full bg-muted overflow-hidden">
          {thumbnailUrl ? (
            <Image
              src={thumbnailUrl}
              alt={title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary/5 to-primary/15">
              <BookOpen className="h-10 w-10 text-primary/30" />
            </div>
          )}
          {!published && (
            <Badge variant="secondary" className="absolute top-3 left-3 bg-background/90 backdrop-blur-sm text-xs">
              非公開
            </Badge>
          )}
          {isComplete && (
            <div className="absolute top-3 right-3 flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 text-white shadow-sm">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          )}
        </div>
        <CardHeader className="pb-2 pt-4">
          <CardTitle className="line-clamp-2 text-base font-semibold leading-snug group-hover:text-primary transition-colors">
            {title}
          </CardTitle>
          <p className="line-clamp-2 text-sm text-muted-foreground mt-1.5 leading-relaxed">{description}</p>
        </CardHeader>
        {totalLessons > 0 && (
          <CardContent className="pt-0 pb-4">
            <div className="space-y-2">
              <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${progressPct}%`,
                    background: isComplete
                      ? 'oklch(0.55 0.15 155)'
                      : 'linear-gradient(90deg, oklch(0.42 0.10 195), oklch(0.55 0.12 195))',
                  }}
                />
              </div>
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  {completedCount} / {totalLessons} レッスン完了
                </p>
                <p className="text-xs font-semibold text-primary">{progressPct}%</p>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </Link>
  )
}
