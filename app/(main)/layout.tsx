import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { SignOutButton } from '@/components/sign-out-button'

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect('/login')

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link href="/courses" className="text-lg font-bold text-gray-900">
            動画講座プラットフォーム
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/courses" className="text-sm text-gray-600 hover:text-gray-900">
              コース一覧
            </Link>
            {session.user.role === 'admin' && (
              <Link href="/admin" className="text-sm text-gray-600 hover:text-gray-900">
                管理画面
              </Link>
            )}
            <span className="text-sm text-gray-500">{session.user.name}</span>
            <SignOutButton />
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  )
}
