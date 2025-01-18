import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { cookies } from 'next/headers'

export async function POST() {
  try {
    const cookieStore = await cookies()
    const sessionId = cookieStore.get('sessionId')?.value

    if (!sessionId) {
      return NextResponse.json({ error: 'No session found' }, { status: 401 })
    }

    await auth.logout(sessionId)
    cookieStore.delete('sessionId')

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json({ error: 'Logout failed' }, { status: 500 })
  }
}
