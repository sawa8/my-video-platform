import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const origin = new URL(req.url).origin

  const res = await fetch(`${origin}/api/auth/sign-in/social`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ provider: 'google', callbackURL: '/courses' }),
  })

  const data = await res.json()

  if (data.url) {
    const redirect = NextResponse.redirect(data.url)

    // BetterAuth が設定した state クッキーをブラウザに転送する
    const setCookies = res.headers.getSetCookie()
    for (const cookie of setCookies) {
      redirect.headers.append('Set-Cookie', cookie)
    }

    return redirect
  }

  return NextResponse.redirect(`${origin}/login`)
}
