'use client'

import { authClient } from '@/lib/auth-client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'

export function SignOutButton() {
  const router = useRouter()
  return (
    <Button
      variant="ghost"
      size="sm"
      className="gap-1.5 text-muted-foreground hover:text-foreground"
      onClick={() =>
        authClient.signOut({
          fetchOptions: { onSuccess: () => router.push('/login') },
        })
      }
    >
      <LogOut className="h-3.5 w-3.5" />
      <span className="hidden sm:inline">ログアウト</span>
    </Button>
  )
}
