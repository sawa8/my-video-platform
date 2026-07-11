import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/auth', () => ({ auth: { api: { getSession: vi.fn() } } }))
vi.mock('@/lib/db', () => ({
  db: {
    insert: vi.fn(),
    query: { courses: { findMany: vi.fn() } },
  },
}))

import { GET, POST } from '@/app/api/courses/route'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

const mockCourses = [
  { id: 'c1', title: 'Course 1', published: true },
  { id: 'c2', title: 'Course 2', published: false },
]

function makePostRequest(body: unknown) {
  return new Request('http://localhost/api/courses', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

describe('GET /api/courses', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('セッションがない場合は 401 を返す', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue(null)

    const res = await GET()

    expect(res.status).toBe(401)
  })

  it('一般ユーザーは published: true のコースのみ取得できる', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({ user: { id: 'u1', role: 'user' } } as any)
    vi.mocked(db.query.courses.findMany).mockResolvedValue([mockCourses[0]] as any)

    const res = await GET()

    expect(res.status).toBe(200)
    // where 条件（eq(courses.published, true)）が渡されている
    expect(db.query.courses.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.anything() }),
    )
  })

  it('管理者は非公開コースも含めて全件取得できる', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({ user: { id: 'u1', role: 'admin' } } as any)
    vi.mocked(db.query.courses.findMany).mockResolvedValue(mockCourses as any)

    const res = await GET()

    expect(res.status).toBe(200)
    // where 条件なし（undefined）で全件取得
    expect(db.query.courses.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: undefined }),
    )
  })
})

describe('POST /api/courses', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('一般ユーザーは 403 を返す', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({ user: { id: 'u1', role: 'user' } } as any)

    const res = await POST(makePostRequest({ title: 'T', description: 'D' }))

    expect(res.status).toBe(403)
  })

  it('セッションがない場合は 403 を返す', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue(null)

    const res = await POST(makePostRequest({ title: 'T', description: 'D' }))

    expect(res.status).toBe(403)
  })

  it('title が未指定の場合は 400 を返す', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({ user: { id: 'u1', role: 'admin' } } as any)

    const res = await POST(makePostRequest({ description: '説明' }))

    expect(res.status).toBe(400)
  })

  it('description が未指定の場合は 400 を返す', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({ user: { id: 'u1', role: 'admin' } } as any)

    const res = await POST(makePostRequest({ title: 'タイトル' }))

    expect(res.status).toBe(400)
  })

  it('管理者は正常にコースを作成できる', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({ user: { id: 'u1', role: 'admin' } } as any)
    const newCourse = { id: 'new-id', title: 'テストコース', description: '説明' }
    const mockReturning = vi.fn().mockResolvedValue([newCourse])
    const mockValues = vi.fn().mockReturnValue({ returning: mockReturning })
    vi.mocked(db.insert).mockReturnValue({ values: mockValues } as any)

    const res = await POST(makePostRequest({ title: 'テストコース', description: '説明' }))

    expect(res.status).toBe(201)
    const data = await res.json()
    expect(data.id).toBeDefined()
  })
})
