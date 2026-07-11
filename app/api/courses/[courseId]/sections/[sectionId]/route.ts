import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { db } from '@/lib/db'
import { sections } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ courseId: string; sectionId: string }> },
) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { sectionId } = await params
  const body = await req.json()

  const updated = await db
    .update(sections)
    .set(body)
    .where(eq(sections.id, sectionId))
    .returning()

  if (!updated.length) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json(updated[0])
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ courseId: string; sectionId: string }> },
) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { sectionId } = await params

  await db.delete(sections).where(eq(sections.id, sectionId))

  return NextResponse.json({ success: true })
}
