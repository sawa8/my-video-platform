// This route is deprecated. User registration is now handled by BetterAuth at /api/auth/sign-up/email.
// The register page uses authClient.signUp.email() directly.
import { NextResponse } from 'next/server'

export async function POST() {
  return NextResponse.json(
    { error: 'このエンドポイントは廃止されました。BetterAuth を使用してください。' },
    { status: 410 },
  )
}
