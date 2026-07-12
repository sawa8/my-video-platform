import { NextRequest, NextResponse } from 'next/server'

// Light-weight session check: only verify cookie presence.
// Full session validation (DB lookup) is done in layouts/pages.
// This avoids loading @libsql native addon in the proxy bundle.
export function proxy(request: NextRequest) {
  // HTTPS 環境では BetterAuth が __Secure- プレフィックスを付ける
  const sessionCookie =
    request.cookies.get('better-auth.session_token') ||
    request.cookies.get('__Secure-better-auth.session_token')

  if (!sessionCookie) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!login|register|api/auth|_next/static|_next/image|favicon.ico|uploads).*)',
  ],
}
