import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth/auth'
import { cookies } from 'next/headers'

export async function GET(request: Request, context: { params: Promise<{ chatId: string }> }) {
  try {
    const params = await context.params

    const cookieStore = await cookies()
    const sessionId = cookieStore.get('sessionId')?.value

    if (!sessionId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await auth.getUser(sessionId)

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const participant = await prisma.chatParticipant.findUnique({
      where: {
        userId_chatId: {
          userId: user.id,
          chatId: params.chatId,
        },
      },
    })

    if (!participant) {
      return NextResponse.json({ error: 'Not authorized to view this chat' }, { status: 403 })
    }

    const messages = await prisma.message.findMany({
      where: {
        chatId: params.chatId,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    })

    return NextResponse.json({ messages })
  } catch (error) {
    console.error('Error fetching messages:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
