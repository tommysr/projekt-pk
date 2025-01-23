import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth/auth'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const chatId = searchParams.get('chatId')

    if (!chatId) {
      return NextResponse.json({ error: 'Chat ID is required' }, { status: 400 })
    }

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
          chatId: chatId,
        },
      },
    })

    if (!participant) {
      return NextResponse.json({ error: 'Not authorized to view this chat' }, { status: 403 })
    }

    // Parse pagination parameters from URL
    const limit = parseInt(searchParams.get('limit') || '50')
    const cursor = searchParams.get('cursor')
    
    const messages = await prisma.message.findMany({
      where: {
        chatId: chatId,
      },
      take: limit,
      ...(cursor && {
        cursor: {
          id: cursor,
        },
        skip: 1, // Skip the cursor
      }),
      include: {
        user: {
          select: {
            id: true,
            username: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc', // Newest first for pagination
      },
    })

    // Get one extra message to determine if there are more
    const nextMessage = await prisma.message.findFirst({
      where: {
        chatId: chatId,
        createdAt: {
          lt: messages[messages.length - 1]?.createdAt,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
      },
    })

    return NextResponse.json({
      messages: messages.reverse(), // Reverse to maintain oldest-first in UI
      nextCursor: messages[messages.length - 1]?.id || null,
      hasMore: !!nextMessage,
    })
  } catch (error) {
    console.error('Error fetching messages:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
