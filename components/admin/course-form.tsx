'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'

interface CourseFormProps {
  courseId?: string
  defaultValues?: {
    title: string
    description: string
    thumbnailUrl: string | null
  }
}

export function CourseForm({ courseId, defaultValues }: CourseFormProps) {
  const router = useRouter()
  const [title, setTitle] = useState(defaultValues?.title ?? '')
  const [description, setDescription] = useState(defaultValues?.description ?? '')
  const [thumbnailUrl, setThumbnailUrl] = useState(defaultValues?.thumbnailUrl ?? '')
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setError('')

    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'アップロードに失敗しました')
      } else {
        setThumbnailUrl(data.url)
      }
    } catch {
      setError('アップロードに失敗しました')
    } finally {
      setUploading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')

    const isEdit = !!courseId
    const url = isEdit ? `/api/courses/${courseId}` : '/api/courses'
    const method = isEdit ? 'PATCH' : 'POST'

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, thumbnailUrl: thumbnailUrl || null }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? '保存に失敗しました')
      } else {
        router.push(`/admin/courses/${data.id}`)
        router.refresh()
      }
    } catch {
      setError('保存に失敗しました')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">タイトル *</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="コースタイトルを入力"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">説明 *</Label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="コースの説明を入力"
          required
          rows={4}
          className="flex min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>

      <div className="space-y-2">
        <Label>サムネイル画像</Label>
        {thumbnailUrl && (
          <div className="relative mb-2 aspect-video w-full max-w-sm overflow-hidden rounded-lg bg-gray-100">
            <Image src={thumbnailUrl} alt="サムネイル" fill className="object-cover" />
          </div>
        )}
        <div className="flex items-center gap-2">
          <Input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
            disabled={uploading}
            className="max-w-sm"
          />
          {uploading && <span className="text-sm text-gray-500">アップロード中...</span>}
        </div>
        <p className="text-xs text-gray-500">jpg / png / webp、2MB 以下</p>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={saving || uploading}>
          {saving ? '保存中...' : courseId ? '更新する' : 'コースを作成'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/admin/courses')}
        >
          キャンセル
        </Button>
      </div>
    </form>
  )
}
