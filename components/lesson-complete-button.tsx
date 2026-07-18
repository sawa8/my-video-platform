'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LessonCompleteButtonProps {
  lessonId: string
  initialCompleted: boolean
}

export function LessonCompleteButton({ lessonId, initialCompleted }: LessonCompleteButtonProps) {
  const [completed, setCompleted] = useState(initialCompleted)
  const [loading, setLoading] = useState(false)

  async function toggle() {
    setLoading(true)
    const next = !completed
    setCompleted(next)

    try {
      const res = await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lessonId, completed: next }),
      })
      if (!res.ok) setCompleted(!next)
    } catch {
      setCompleted(!next)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      onClick={toggle}
      disabled={loading}
      size="lg"
      variant={completed ? 'default' : 'outline'}
      className={cn(
        'gap-2 transition-all duration-200',
        completed
          ? 'bg-sky-500 hover:bg-sky-600 text-white shadow-sm'
          : 'border-border/60 hover:bg-primary hover:text-primary-foreground hover:border-primary'
      )}
    >
      <CheckCircle2 className="h-4 w-4" />
      {completed ? '完了済み' : 'レッスンを完了にする'}
    </Button>
  )
}
