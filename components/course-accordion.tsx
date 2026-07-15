'use client'

import Link from 'next/link'
import { CheckCircle2, Circle, PlayCircle } from 'lucide-react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { useProgress } from '@/hooks/use-progress'
import { cn } from '@/lib/utils'

interface Lesson {
  id: string
  title: string
  description: string | null
  youtubeUrl: string
  sortOrder: number
}

interface Section {
  id: string
  title: string
  lessons: Lesson[]
}

interface CourseAccordionProps {
  sections: Section[]
  courseId: string
  initialCompleted: string[]
}

export function CourseAccordion({ sections, courseId, initialCompleted }: CourseAccordionProps) {
  const { completed, toggle, loading } = useProgress(new Set(initialCompleted))

  return (
    <Accordion defaultValue={sections.map((s) => s.id)} className="space-y-3">
      {sections.map((section) => {
        const sectionLessons = section.lessons
        const sectionCompleted = sectionLessons.filter((l) => completed.has(l.id)).length
        const isAllDone = sectionLessons.length > 0 && sectionCompleted === sectionLessons.length

        return (
          <AccordionItem
            key={section.id}
            value={section.id}
            className="rounded-xl border border-border/50 bg-card shadow-sm overflow-hidden"
          >
            <AccordionTrigger className="px-5 py-4 hover:no-underline hover:bg-muted/30 transition-colors">
              <div className="flex items-center justify-between w-full pr-2">
                <span className="font-semibold text-foreground text-left">{section.title}</span>
                <span className={cn(
                  "text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ml-3",
                  isAllDone
                    ? "bg-emerald-50 text-emerald-600"
                    : "bg-muted text-muted-foreground"
                )}>
                  {sectionCompleted}/{sectionLessons.length}
                </span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-5 pb-4 pt-0">
              <ul className="space-y-1">
                {sectionLessons.map((lesson) => {
                  const isCompleted = completed.has(lesson.id)
                  const isLoading = loading === lesson.id

                  return (
                    <li key={lesson.id} className="flex items-center gap-3 rounded-lg px-3 py-2.5 -mx-1 hover:bg-muted/40 transition-colors">
                      <button
                        onClick={() => toggle(lesson.id)}
                        disabled={isLoading}
                        className={cn(
                          'shrink-0 transition-all duration-200',
                          isCompleted
                            ? 'text-emerald-500 hover:text-emerald-600'
                            : 'text-border hover:text-muted-foreground',
                        )}
                        title={isCompleted ? '完了を取り消す' : '完了にする'}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="h-5 w-5" />
                        ) : (
                          <Circle className="h-5 w-5" />
                        )}
                      </button>
                      <Link
                        href={`/courses/${courseId}/lessons/${lesson.id}`}
                        className={cn(
                          'flex-1 flex items-center gap-2 text-sm transition-colors',
                          isCompleted
                            ? 'text-muted-foreground line-through decoration-muted-foreground/40'
                            : 'text-foreground hover:text-primary',
                        )}
                      >
                        <PlayCircle className="h-3.5 w-3.5 shrink-0 opacity-40" />
                        {lesson.title}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </AccordionContent>
          </AccordionItem>
        )
      })}
    </Accordion>
  )
}
