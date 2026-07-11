import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock next/headers so API route tests don't fail when calling headers()
vi.mock('next/headers', () => ({
  headers: vi.fn(() => new Headers()),
  cookies: vi.fn(() => ({ get: vi.fn(), set: vi.fn(), delete: vi.fn() })),
}))
