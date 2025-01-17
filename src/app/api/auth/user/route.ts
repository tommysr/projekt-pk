import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { cookies } from 'next/headers'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const sessionId = cookieStore.get('sessionId')?.value

    if (!sessionId) {
      return NextResponse.json({ error: 'No session found' }, { status: 401 })
    }

    console.log('Found session cookie:', {
      encoded: sessionId.substring(0, 8) + '...',
      decoded: decodeURIComponent(sessionId).substring(0, 8) + '...',
    })

    // Decode the session ID
    const decodedSessionId = decodeURIComponent(sessionId)
    console.log('Verifying user session:', decodedSessionId.substring(0, 8) + '...')

    const user = await auth.getUser(decodedSessionId)
    if (!user) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Error in user route:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
