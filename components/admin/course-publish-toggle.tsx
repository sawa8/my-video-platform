'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

interface CoursePublishToggleProps {
  courseId: string
  published: boolean
}

export function CoursePublishToggle({ courseId, published }: CoursePublishToggleProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function toggle() {
    setLoading(true)
    await fetch(`/api/courses/${courseId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ published: !published }),
    })
    setLoading(false)
    router.refresh()
  }

  return (
    <Button variant="outline" size="sm" onClick={toggle} disabled={loading}>
      {published ? '非公開にする' : '公開する'}
    </Button>
  )
}
