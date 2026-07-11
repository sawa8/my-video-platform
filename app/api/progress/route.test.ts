import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/auth', () => ({ auth: { api: { getSession: vi.fn() } } }))
vi.mock('@/lib/db', () => ({
  db: {
    insert: vi.fn(),
    delete: vi.fn(),
    query: { progress: { findMany: vi.fn() } },
  },
}))

import { POST } from '@/app/api/progress/route'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

function makeRequest(body: unknown) {
  return new Request('http://localhost/api/progress', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

function mockSession(role: 'admin' | 'user' = 'user') {
  vi.mocked(auth.api.getSession).mockResolvedValue({ user: { id: 'user1', role } } as any)
}

describe('POST /api/progress', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('認証チェック', () => {
    it('セッションがない場合は 401 を返す', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue(null)

      const res = await POST(makeRequest({ lessonId: 'lesson1', completed: true }))

      expect(res.status).toBe(401)
      const data = await res.json()
      expect(data.error).toBe('Unauthorized')
    })
  })

  describe('バリデーション', () => {
    it('lessonId が未指定の場合は 400 を返す', async () => {
      mockSession()

      const res = await POST(makeRequest({ completed: true }))

      expect(res.status).toBe(400)
    })

    it('completed が boolean でない場合は 400 を返す', async () => {
      mockSession()

      const res = await POST(makeRequest({ lessonId: 'abc', completed: 'yes' }))

      expect(res.status).toBe(400)
    })
  })

  describe('completed: true のとき', () => {
    it('db.insert が呼ばれる', async () => {
      mockSession()
      const mockOnConflictDoNothing = vi.fn().mockResolvedValue(undefined)
      const mockValues = vi.fn().mockReturnValue({ onConflictDoNothing: mockOnConflictDoNothing })
      vi.mocked(db.insert).mockReturnValue({ values: mockValues } as any)

      const res = await POST(makeRequest({ lessonId: 'lesson1', completed: true }))

      expect(db.insert).toHaveBeenCalledTimes(1)
      expect(res.status).toBe(200)
      const data = await res.json()
      expect(data).toEqual({ lessonId: 'lesson1', completed: true })
    })

    it('同じレッスンを重複して完了しても onConflictDoNothing で重複しない', async () => {
      mockSession()
      const mockOnConflictDoNothing = vi.fn().mockResolvedValue(undefined)
      const mockValues = vi.fn().mockReturnValue({ onConflictDoNothing: mockOnConflictDoNothing })
      vi.mocked(db.insert).mockReturnValue({ values: mockValues } as any)

      await POST(makeRequest({ lessonId: 'lesson1', completed: true }))

      expect(mockOnConflictDoNothing).toHaveBeenCalledTimes(1)
    })
  })

  describe('completed: false のとき', () => {
    it('db.delete が呼ばれる', async () => {
      mockSession()
      const mockWhere = vi.fn().mockResolvedValue(undefined)
      vi.mocked(db.delete).mockReturnValue({ where: mockWhere } as any)

      const res = await POST(makeRequest({ lessonId: 'lesson1', completed: false }))

      expect(db.delete).toHaveBeenCalledTimes(1)
      expect(res.status).toBe(200)
      const data = await res.json()
      expect(data).toEqual({ lessonId: 'lesson1', completed: false })
    })
  })
})
