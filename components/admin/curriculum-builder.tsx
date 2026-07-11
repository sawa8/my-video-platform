'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Plus, Pencil, Trash2, ChevronUp, ChevronDown, GripVertical } from 'lucide-react'

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
  sortOrder: number
  lessons: Lesson[]
}

interface CurriculumBuilderProps {
  courseId: string
  initialSections: Section[]
}

export function CurriculumBuilder({ courseId, initialSections }: CurriculumBuilderProps) {
  const router = useRouter()
  const [sections, setSections] = useState<Section[]>(initialSections)
  const [newSectionTitle, setNewSectionTitle] = useState('')
  const [addingSection, setAddingSection] = useState(false)
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null)
  const [editingSectionTitle, setEditingSectionTitle] = useState('')

  async function addSection() {
    if (!newSectionTitle.trim()) return
    setAddingSection(true)

    const maxOrder = sections.length > 0 ? Math.max(...sections.map((s) => s.sortOrder)) + 1 : 0

    const res = await fetch(`/api/courses/${courseId}/sections`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newSectionTitle.trim(), sortOrder: maxOrder }),
    })
    const data = await res.json()
    if (res.ok) {
      setSections((prev) => [...prev, { ...data, lessons: [] }])
      setNewSectionTitle('')
    }
    setAddingSection(false)
  }

  async function updateSectionTitle(sectionId: string, title: string) {
    await fetch(`/api/courses/${courseId}/sections/${sectionId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title }),
    })
    setSections((prev) =>
      prev.map((s) => (s.id === sectionId ? { ...s, title } : s)),
    )
    setEditingSectionId(null)
  }

  async function deleteSection(sectionId: string) {
    if (!confirm('このセクションを削除しますか？レッスンもすべて削除されます。')) return
    await fetch(`/api/courses/${courseId}/sections/${sectionId}`, { method: 'DELETE' })
    setSections((prev) => prev.filter((s) => s.id !== sectionId))
  }

  async function moveSectionUp(index: number) {
    if (index === 0) return
    const updated = [...sections]
    const a = updated[index - 1]
    const b = updated[index]
    // sortOrder を swap
    ;[a.sortOrder, b.sortOrder] = [b.sortOrder, a.sortOrder]
    ;[updated[index - 1], updated[index]] = [b, a]
    setSections(updated)
    await Promise.all([
      fetch(`/api/courses/${courseId}/sections/${a.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sortOrder: a.sortOrder }),
      }),
      fetch(`/api/courses/${courseId}/sections/${b.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sortOrder: b.sortOrder }),
      }),
    ])
  }

  async function moveSectionDown(index: number) {
    if (index === sections.length - 1) return
    await moveSectionUp(index + 1)
  }

  return (
    <div className="space-y-4">
      {sections.map((section, sIndex) => (
        <Card key={section.id} className="shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <GripVertical className="h-4 w-4 text-gray-300 shrink-0" />
              {editingSectionId === section.id ? (
                <div className="flex flex-1 items-center gap-2">
                  <Input
                    value={editingSectionTitle}
                    onChange={(e) => setEditingSectionTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') updateSectionTitle(section.id, editingSectionTitle)
                      if (e.key === 'Escape') setEditingSectionId(null)
                    }}
                    autoFocus
                    className="h-8"
                  />
                  <Button
                    size="sm"
                    onClick={() => updateSectionTitle(section.id, editingSectionTitle)}
                  >
                    保存
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setEditingSectionId(null)}
                  >
                    キャンセル
                  </Button>
                </div>
              ) : (
                <span className="flex-1 font-medium">{section.title}</span>
              )}
              <div className="flex items-center gap-1 shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => moveSectionUp(sIndex)}
                  disabled={sIndex === 0}
                >
                  <ChevronUp className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => moveSectionDown(sIndex)}
                  disabled={sIndex === sections.length - 1}
                >
                  <ChevronDown className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => {
                    setEditingSectionId(section.id)
                    setEditingSectionTitle(section.title)
                  }}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-red-500 hover:text-red-600"
                  onClick={() => deleteSection(section.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <LessonList
              courseId={courseId}
              section={section}
              onUpdate={(updatedLessons) => {
                setSections((prev) =>
                  prev.map((s) =>
                    s.id === section.id ? { ...s, lessons: updatedLessons } : s,
                  ),
                )
              }}
            />
          </CardContent>
        </Card>
      ))}

      {/* セクション追加 */}
      <div className="flex items-center gap-2">
        <Input
          value={newSectionTitle}
          onChange={(e) => setNewSectionTitle(e.target.value)}
          placeholder="新しいセクション名"
          onKeyDown={(e) => e.key === 'Enter' && addSection()}
          className="max-w-sm"
        />
        <Button onClick={addSection} disabled={addingSection || !newSectionTitle.trim()}>
          <Plus className="mr-1 h-4 w-4" />
          セクションを追加
        </Button>
      </div>
    </div>
  )
}

// ─── レッスンリスト ────────────────────────────────────────────────────────────
function LessonList({
  courseId,
  section,
  onUpdate,
}: {
  courseId: string
  section: Section
  onUpdate: (lessons: Lesson[]) => void
}) {
  const [lessons, setLessons] = useState<Lesson[]>(section.lessons)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null)
  const [lessonTitle, setLessonTitle] = useState('')
  const [lessonDescription, setLessonDescription] = useState('')
  const [lessonUrl, setLessonUrl] = useState('')
  const [saving, setSaving] = useState(false)

  function openAddDialog() {
    setEditingLesson(null)
    setLessonTitle('')
    setLessonDescription('')
    setLessonUrl('')
    setDialogOpen(true)
  }

  function openEditDialog(lesson: Lesson) {
    setEditingLesson(lesson)
    setLessonTitle(lesson.title)
    setLessonDescription(lesson.description ?? '')
    setLessonUrl(lesson.youtubeUrl)
    setDialogOpen(true)
  }

  async function saveLesson() {
    setSaving(true)
    const isEdit = !!editingLesson
    const url = isEdit
      ? `/api/courses/${courseId}/sections/${section.id}/lessons/${editingLesson.id}`
      : `/api/courses/${courseId}/sections/${section.id}/lessons`
    const method = isEdit ? 'PATCH' : 'POST'
    const maxOrder =
      lessons.length > 0 ? Math.max(...lessons.map((l) => l.sortOrder)) + 1 : 0

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: lessonTitle,
        description: lessonDescription || null,
        youtubeUrl: lessonUrl,
        sortOrder: isEdit ? editingLesson.sortOrder : maxOrder,
      }),
    })
    const data = await res.json()

    if (res.ok) {
      const updated = isEdit
        ? lessons.map((l) => (l.id === editingLesson.id ? data : l))
        : [...lessons, data]
      setLessons(updated)
      onUpdate(updated)
      setDialogOpen(false)
    }
    setSaving(false)
  }

  async function deleteLesson(lessonId: string) {
    if (!confirm('このレッスンを削除しますか？')) return
    await fetch(
      `/api/courses/${courseId}/sections/${section.id}/lessons/${lessonId}`,
      { method: 'DELETE' },
    )
    const updated = lessons.filter((l) => l.id !== lessonId)
    setLessons(updated)
    onUpdate(updated)
  }

  async function moveLessonUp(index: number) {
    if (index === 0) return
    const updated = [...lessons]
    const a = updated[index - 1]
    const b = updated[index]
    ;[a.sortOrder, b.sortOrder] = [b.sortOrder, a.sortOrder]
    ;[updated[index - 1], updated[index]] = [b, a]
    setLessons(updated)
    onUpdate(updated)
    await Promise.all([
      fetch(`/api/courses/${courseId}/sections/${section.id}/lessons/${a.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sortOrder: a.sortOrder }),
      }),
      fetch(`/api/courses/${courseId}/sections/${section.id}/lessons/${b.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sortOrder: b.sortOrder }),
      }),
    ])
  }

  return (
    <div className="space-y-2">
      {lessons.map((lesson, lIndex) => (
        <div
          key={lesson.id}
          className="flex items-center gap-2 rounded-md border bg-gray-50 px-3 py-2"
        >
          <span className="flex-1 text-sm">{lesson.title}</span>
          <div className="flex items-center gap-1 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => moveLessonUp(lIndex)}
              disabled={lIndex === 0}
            >
              <ChevronUp className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => moveLessonUp(lIndex + 1)}
              disabled={lIndex === lessons.length - 1}
            >
              <ChevronDown className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => openEditDialog(lesson)}
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-red-500 hover:text-red-600"
              onClick={() => deleteLesson(lesson.id)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      ))}

      {lessons.length === 0 && (
        <p className="text-sm text-gray-400">レッスンがありません</p>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger
          render={<Button variant="outline" size="sm" onClick={openAddDialog} />}
        >
          <Plus className="mr-1 h-3.5 w-3.5" />
          レッスンを追加
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingLesson ? 'レッスンを編集' : 'レッスンを追加'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>タイトル *</Label>
              <Input
                value={lessonTitle}
                onChange={(e) => setLessonTitle(e.target.value)}
                placeholder="レッスンタイトル"
              />
            </div>
            <div className="space-y-2">
              <Label>YouTube URL *</Label>
              <Input
                value={lessonUrl}
                onChange={(e) => setLessonUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
              />
            </div>
            <div className="space-y-2">
              <Label>説明（任意）</Label>
              <textarea
                value={lessonDescription}
                onChange={(e) => setLessonDescription(e.target.value)}
                placeholder="レッスンの説明"
                rows={3}
                className="flex min-h-16 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={saveLesson}
                disabled={saving || !lessonTitle.trim() || !lessonUrl.trim()}
              >
                {saving ? '保存中...' : '保存'}
              </Button>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                キャンセル
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
