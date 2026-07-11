'use client'

import { useState, useCallback } from 'react'

export function useProgress(initialCompleted: Set<string>) {
  const [completed, setCompleted] = useState<Set<string>>(initialCompleted)
  const [loading, setLoading] = useState<string | null>(null)

  const toggle = useCallback(async (lessonId: string) => {
    const isCompleted = completed.has(lessonId)
    // 楽観的 UI 更新
    setCompleted((prev) => {
      const next = new Set(prev)
      if (isCompleted) next.delete(lessonId)
      else next.add(lessonId)
      return next
    })
    setLoading(lessonId)

    try {
      const res = await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lessonId, completed: !isCompleted }),
      })

      if (!res.ok) {
        // ロールバック
        setCompleted((prev) => {
          const next = new Set(prev)
          if (isCompleted) next.add(lessonId)
          else next.delete(lessonId)
          return next
        })
      }
    } catch {
      // ロールバック
      setCompleted((prev) => {
        const next = new Set(prev)
        if (isCompleted) next.add(lessonId)
        else next.delete(lessonId)
        return next
      })
    } finally {
      setLoading(null)
    }
  }, [completed])

  return { completed, toggle, loading }
}
