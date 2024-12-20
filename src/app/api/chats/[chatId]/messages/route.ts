import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { sessions } from '@/lib/auth/redis'

export async function GET(request: Request, { params }: { params: { chatId: string } }) {
  try {
    const sessionId = (await cookies()).get('sessionId')?.value
    if (!sessionId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = await sessions.verify(sessionId)
    if (!userId) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
    }

    // Verify user is a participant in the chat
    const participant = await prisma.chatParticipant.findUnique({
      where: {
        userId_chatId: {
          userId,
          chatId: params.chatId,
        },
      },
    })

    if (!participant) {
      return NextResponse.json({ error: 'Not a chat participant' }, { status: 403 })
    }

    // Fetch messages
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

    console.log(messages)

    return NextResponse.json({ messages })
  } catch (error) {
    console.error('Error fetching messages:', error)
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
  }
}
