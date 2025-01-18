import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    const cookieStore = await cookies()
    const sessionIdCookie = cookieStore.get('sessionId')?.value

    if (sessionIdCookie) {
      return NextResponse.json({ error: 'Already logged in' }, { status: 400 })
    }

    const { user, sessionId } = await auth.login(email, password)

    const response = NextResponse.json({ user })

    // Log the session ID before encoding
    console.log('Setting session cookie:', {
      original: sessionId.substring(0, 8) + '...',
      encoded: encodeURIComponent(sessionId).substring(0, 8) + '...',
    })

    response.cookies.set({
      name: 'sessionId',
      value: encodeURIComponent(sessionId),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24, // 1 day
    })

    return response
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Login failed' },
      { status: 400 }
    )
  }
}
