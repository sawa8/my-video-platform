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
      variant={completed ? 'default' : 'outline'}
      className={cn(completed && 'bg-green-600 hover:bg-green-700')}
    >
      <CheckCircle2 className="mr-2 h-4 w-4" />
      {completed ? '完了済み' : 'レッスンを完了にする'}
    </Button>
  )
}
