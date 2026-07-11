import { describe, it, expect } from 'vitest'
import { extractYouTubeId } from '@/lib/utils'

describe('extractYouTubeId', () => {
  it('標準 URL から ID を抽出できる', () => {
    expect(extractYouTubeId('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ')
  })

  it('短縮 URL (youtu.be) から ID を抽出できる', () => {
    expect(extractYouTubeId('https://youtu.be/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ')
  })

  it('embed URL から ID を抽出できる', () => {
    expect(extractYouTubeId('https://www.youtube.com/embed/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ')
  })

  it('クエリパラメータが複数あっても ID を抽出できる', () => {
    expect(
      extractYouTubeId('https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=30&list=PLxxx'),
    ).toBe('dQw4w9WgXcQ')
  })

  it('YouTube 以外の URL は null を返す', () => {
    expect(extractYouTubeId('https://vimeo.com/123456789')).toBeNull()
  })

  it('空文字は null を返す', () => {
    expect(extractYouTubeId('')).toBeNull()
  })

  it('不正な形式の URL は null を返す', () => {
    expect(extractYouTubeId('not-a-url')).toBeNull()
  })
})
