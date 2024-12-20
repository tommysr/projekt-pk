import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { cookies } from 'next/headers'

export async function GET() {
  try {
    const sessionId = (await cookies()).get('sessionId')?.value

    if (!sessionId) {
      return NextResponse.json({ user: null }, { status: 200 })
    }

    const user = await auth.getUser(sessionId)

    return NextResponse.json({ user }, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to retrieve user' },
      { status: 400 }
    )
  }
}
