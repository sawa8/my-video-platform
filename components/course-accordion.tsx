'use client'

import Link from 'next/link'
import { CheckCircle2, Circle, ChevronDown } from 'lucide-react'
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
    <Accordion defaultValue={sections.map((s) => s.id)} className="space-y-2">
      {sections.map((section) => {
        const sectionLessons = section.lessons
        const sectionCompleted = sectionLessons.filter((l) => completed.has(l.id)).length

        return (
          <AccordionItem
            key={section.id}
            value={section.id}
            className="rounded-lg border bg-white shadow-sm"
          >
            <AccordionTrigger className="px-4 hover:no-underline">
              <div className="flex items-center justify-between w-full pr-2">
                <span className="font-medium text-left">{section.title}</span>
                <span className="text-sm text-gray-500 shrink-0">
                  {sectionCompleted}/{sectionLessons.length}
                </span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <ul className="space-y-2">
                {sectionLessons.map((lesson) => {
                  const isCompleted = completed.has(lesson.id)
                  const isLoading = loading === lesson.id

                  return (
                    <li key={lesson.id} className="flex items-center gap-3">
                      <button
                        onClick={() => toggle(lesson.id)}
                        disabled={isLoading}
                        className={cn(
                          'shrink-0 transition-colors',
                          isCompleted ? 'text-green-500' : 'text-gray-300 hover:text-gray-400',
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
                          'flex-1 text-sm hover:text-blue-600 hover:underline',
                          isCompleted ? 'text-gray-400 line-through' : 'text-gray-800',
                        )}
                      >
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
