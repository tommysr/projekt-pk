import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'

export async function POST(request: Request) {
  try {
    const { username, email, password } = await request.json()

    const authResponse = await auth.register(username, email, password)

    return NextResponse.json({
      message: 'Registration successful. You can now log in.',
      user: authResponse.user,
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Registration failed' },
      { status: 400 }
    )
  }
}
