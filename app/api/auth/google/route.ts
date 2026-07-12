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
    // クッキーを確実にセットしてからリダイレクトするため、
    // 307 リダイレクトではなく HTML ページを返す。
    // ブラウザが Set-Cookie を処理した後に meta refresh でリダイレクト。
    const html = `<!DOCTYPE html>
<html>
<head><meta http-equiv="refresh" content="0;url=${data.url}"></head>
<body><p>Redirecting to Google...</p></body>
</html>`

    const response = new NextResponse(html, {
      status: 200,
      headers: { 'Content-Type': 'text/html' },
    })

    // BetterAuth が設定した state クッキーをブラウザに転送する
    const setCookies = res.headers.getSetCookie()
    for (const cookie of setCookies) {
      response.headers.append('Set-Cookie', cookie)
    }

    return response
  }

  return NextResponse.redirect(`${origin}/login`)
}
