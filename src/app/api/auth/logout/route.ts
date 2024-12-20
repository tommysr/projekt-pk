import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { cookies } from 'next/headers'

export async function POST() {
  try {
    const sessionId = (await cookies()).get('sessionId')?.value

    if (sessionId) {
      await auth.logout(sessionId)
    }

    const response = NextResponse.json({ message: 'Logged out successfully' })

    response.cookies.set('sessionId', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      expires: new Date(0), // Expire the cookie immediately
    })

    return response
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Logout failed' },
      { status: 400 }
    )
  }
}
