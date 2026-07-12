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
    return NextResponse.redirect(data.url)
  }

  return NextResponse.redirect(`${origin}/login`)
}
