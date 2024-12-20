import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()
    const authResponse = await auth.login(email, password)

    const response = NextResponse.json({ user: authResponse.user })

    response.cookies.set('sessionId', authResponse.sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/', // Ensure cookie is sent on all routes
      maxAge: 60 * 60 * 24, // 24 hours
    })

    return response
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Login failed' },
      { status: 400 }
    )
  }
}
