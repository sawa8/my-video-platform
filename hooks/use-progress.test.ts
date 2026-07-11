import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useProgress } from '@/hooks/use-progress'

describe('useProgress', () => {
  let mockFetch: ReturnType<typeof vi.fn>

  beforeEach(() => {
    mockFetch = vi.fn()
    vi.stubGlobal('fetch', mockFetch)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  function stubFetchOk() {
    mockFetch.mockResolvedValue(new Response(JSON.stringify({}), { status: 200 }))
  }

  function stubFetchFail() {
    mockFetch.mockResolvedValue(new Response(JSON.stringify({}), { status: 500 }))
  }

  it('initialCompleted を初期状態として持つ', () => {
    const { result } = renderHook(() => useProgress(new Set(['lesson1'])))
    expect(result.current.completed.has('lesson1')).toBe(true)
  })

  describe('toggle（未完了 → 完了）', () => {
    it('fetch が POST { lessonId, completed: true } で呼ばれる', async () => {
      stubFetchOk()
      const { result } = renderHook(() => useProgress(new Set()))

      await act(async () => {
        await result.current.toggle('lesson1')
      })

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/progress',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ lessonId: 'lesson1', completed: true }),
        }),
      )
    })

    it('fetch 成功前に楽観的更新で状態が変わる（同期的）', async () => {
      let resolveFetch!: (r: Response) => void
      mockFetch.mockImplementation(
        () => new Promise<Response>((resolve) => { resolveFetch = resolve }),
      )

      const { result } = renderHook(() => useProgress(new Set()))

      // toggle を開始するが await しない（同期部分だけ実行）
      act(() => { result.current.toggle('lesson1') })

      // fetch が完了する前にすでに状態が更新されている
      expect(result.current.completed.has('lesson1')).toBe(true)

      // 残りの非同期処理を完了させる（クリーンアップ）
      await act(async () => {
        resolveFetch(new Response(JSON.stringify({}), { status: 200 }))
      })
    })

    it('fetch 失敗時にロールバックされる', async () => {
      stubFetchFail()
      const { result } = renderHook(() => useProgress(new Set()))

      await act(async () => {
        await result.current.toggle('lesson1')
      })

      expect(result.current.completed.has('lesson1')).toBe(false)
    })
  })

  describe('toggle（完了 → 未完了）', () => {
    it('fetch が POST { lessonId, completed: false } で呼ばれる', async () => {
      stubFetchOk()
      const { result } = renderHook(() => useProgress(new Set(['lesson1'])))

      await act(async () => {
        await result.current.toggle('lesson1')
      })

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/progress',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ lessonId: 'lesson1', completed: false }),
        }),
      )
    })

    it('fetch 失敗時にロールバックされる', async () => {
      stubFetchFail()
      const { result } = renderHook(() => useProgress(new Set(['lesson1'])))

      await act(async () => {
        await result.current.toggle('lesson1')
      })

      expect(result.current.completed.has('lesson1')).toBe(true)
    })
  })

  describe('loading 状態', () => {
    it('toggle 中は loading が lessonId になる', async () => {
      let resolveFetch!: (r: Response) => void
      mockFetch.mockImplementation(
        () => new Promise<Response>((resolve) => { resolveFetch = resolve }),
      )

      const { result } = renderHook(() => useProgress(new Set()))

      act(() => { result.current.toggle('lesson1') })

      expect(result.current.loading).toBe('lesson1')

      await act(async () => {
        resolveFetch(new Response(JSON.stringify({}), { status: 200 }))
      })
    })

    it('toggle 完了後は loading が null になる', async () => {
      stubFetchOk()
      const { result } = renderHook(() => useProgress(new Set()))

      await act(async () => {
        await result.current.toggle('lesson1')
      })

      expect(result.current.loading).toBeNull()
    })
  })
})
