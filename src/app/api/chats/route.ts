import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth/auth'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const sessionId = cookieStore.get('sessionId')?.value

    if (!sessionId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await auth.getUser(sessionId)

    if (!user) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
    }

    const chats = await prisma.chatParticipant.findMany({
      where: { userId: user.id },
      include: {
        chat: {
          include: {
            participants: {
              include: {
                user: {
                  select: {
                    id: true,
                    username: true,
                  },
                },
              },
            },
          },
        },
      },
    })

    return NextResponse.json({ chats })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch chats' },
      { status: 500 }
    )
  }
}
