'use client'

import { authClient } from '@/lib/auth-client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

export function SignOutButton() {
  const router = useRouter()
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() =>
        authClient.signOut({
          fetchOptions: { onSuccess: () => router.push('/login') },
        })
      }
    >
      ログアウト
    </Button>
  )
}
