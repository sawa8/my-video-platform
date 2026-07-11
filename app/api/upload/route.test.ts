import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/auth', () => ({ auth: { api: { getSession: vi.fn() } } }))
vi.mock('@vercel/blob', () => ({
  put: vi.fn().mockResolvedValue({ url: 'https://xsng0vduhnne5g0q.public.blob.vercel-storage.com/uploads/test.jpeg' }),
}))

import { POST } from '@/app/api/upload/route'
import { auth } from '@/lib/auth'
import { put } from '@vercel/blob'

function makeFile(type: string, size: number): File {
  const content = new Uint8Array(size)
  return new File([content], 'test.jpg', { type })
}

function makeRequest(file: File | null) {
  const formData = new FormData()
  if (file) formData.append('file', file)
  return new Request('http://localhost/api/upload', {
    method: 'POST',
    body: formData,
  })
}

describe('POST /api/upload', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('管理者以外は 403 を返す', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({ user: { id: 'u1', role: 'user' } } as any)

    const res = await POST(makeRequest(makeFile('image/jpeg', 100)))

    expect(res.status).toBe(403)
  })

  it('ファイルが添付されていない場合は 400 を返す', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({ user: { id: 'u1', role: 'admin' } } as any)

    const res = await POST(makeRequest(null))

    expect(res.status).toBe(400)
  })

  it('許可されていない MIME タイプは 400 を返す', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({ user: { id: 'u1', role: 'admin' } } as any)

    const res = await POST(makeRequest(makeFile('image/gif', 100)))

    expect(res.status).toBe(400)
  })

  it('2MB を超えるファイルは 400 を返す', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({ user: { id: 'u1', role: 'admin' } } as any)

    const res = await POST(makeRequest(makeFile('image/jpeg', 3 * 1024 * 1024)))

    expect(res.status).toBe(400)
  })

  it('正常なファイルは Vercel Blob の URL を返す', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({ user: { id: 'u1', role: 'admin' } } as any)

    const res = await POST(makeRequest(makeFile('image/jpeg', 500 * 1024)))

    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.url).toMatch(/^https:\/\/.*\.public\.blob\.vercel-storage\.com\//)
    expect(put).toHaveBeenCalledOnce()
  })
})
